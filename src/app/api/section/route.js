// src/app/api/section/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route' // ✅ Import authOptions
import connectDB from '@/lib/mongoose' 
import Section from '../../../models/Section'
import Course from '../../../models/Course'
import { createCrudRoutes } from '@/lib/crudHandler'

const requiredFields = ['title', 'courseId', 'duration']

// Custom validation function for section-specific rules
const sectionValidation = async (data, operation) => {
  const errors = [];

  // Title validation
  if (data.title) {
    if (data.title.length < 3 || data.title.length > 100) {
      errors.push('Section title must be between 3 and 100 characters');
    }
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.push('Section description cannot exceed 500 characters');
  }

  // Order validation
  if (data.order !== undefined && data.order < 1) {
    errors.push('Section order must be at least 1');
  }

  // Course validation (without user ownership check)
  if (data.courseId && operation === 'create') {
    const course = await Course.findById(data.courseId);
    if (!course || course.isDeleted || !course.isActive) {
      errors.push('Invalid or inactive course');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Section validation failed' : 'Valid',
    errors
  };
};

// Enhanced CRUD route options for sections
const routeOptions = {
  excludeFromResponse: [],
  allowPartialUpdate: true,
  enableSoftDelete: true,
  customValidation: sectionValidation,
  requireAuth: true
};

const routes = createCrudRoutes(Section, requiredFields, routeOptions);

// POST handler WITH authentication
export async function POST(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    console.log('Session check:', { 
      hasSession: !!session,
      userId: session?.user?.id,
      phoneNumber: session?.user?.phoneNumber 
    });
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const data = await req.json();
    console.log('Creating section with data:', { ...data, courseId: data.courseId });
    
    // Verify course exists
    const course = await Course.findById(data.courseId);
    if (!course || course.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Course not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can edit this course
    // Assuming you have a method to check ownership/permissions
    // If Course model doesn't have canEdit method, use a simple ownership check
    if (course.userID && course.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to create sections in this course' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set default values with user ID
    data.isPublished = data.isPublished || false;
    data.isActive = true;
    data.isDeleted = false;
    data.createdBy = session.user.id;
    
    // If no order is specified, set it to the next available order
    if (!data.order) {
      const maxOrder = await Section.findOne({ courseId: data.courseId })
        .sort({ order: -1 })
        .select('order');
      data.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    // Create section
    const section = new Section(data);
    await section.save();
    
    console.log('Section created successfully:', section._id);
    
    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Section created successfully',
        data: section
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Section creation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error creating section', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET handler WITHOUT authentication (public access)
export async function GET(req) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const courseId = url.searchParams.get('courseId');
    const published = url.searchParams.get('published');
    const includeResources = url.searchParams.get('includeResources') === 'true';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50);

    if (id) {
      // Get single section
      let query = Section.findById(id);
      
      if (includeResources) {
        query = query.populate({
          path: 'resources',
          match: { isPublished: true, isActive: true, isDeleted: false },
          options: { sort: { order: 1 } },
          select: 'title type duration isRequired url description'
        });
      }
      
      query = query.populate('courseId', 'title userID');

      const section = await query;

      if (!section || section.isDeleted) {
        return new Response(
          JSON.stringify({ success: false, msg: 'Section not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          msg: 'Section retrieved successfully',
          data: section
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query for multiple sections
    let query = { isActive: true, isDeleted: false };

    if (courseId) {
      query.courseId = courseId;
    }

    if (published !== null && published !== undefined) {
      query.isPublished = published === 'true';
    }

    const skip = (page - 1) * limit;

    let findQuery = Section.find(query)
      .populate('courseId', 'title userID')
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit);

    if (includeResources) {
      findQuery = findQuery.populate({
        path: 'resources',
        match: { isPublished: true, isActive: true, isDeleted: false },
        options: { sort: { order: 1 } },
        select: 'title type duration isRequired url description'
      });
    }

    const [sections, total] = await Promise.all([
      findQuery,
      Section.countDocuments(query)
    ]);

    const meta = {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Sections retrieved successfully',
        data: sections,
        ...meta
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error retrieving sections', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PATCH handler WITH authentication
export async function PATCH(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if section exists and user owns it
    const section = await Section.findById(id).populate('courseId');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can edit the course this section belongs to
    if (section.courseId.userID && section.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to update this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    
    // Update section
    const updatedSection = await Section.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Section updated successfully',
        data: updatedSection
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error updating section', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE handler WITH authentication
export async function DELETE(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if section exists and user owns it
    const section = await Section.findById(id).populate('courseId');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can edit the course this section belongs to
    if (section.courseId.userID && section.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete
    await Section.findByIdAndUpdate(id, { 
      isDeleted: true, 
      isActive: false,
      deletedAt: new Date() 
    });

    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Section deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error deleting section', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
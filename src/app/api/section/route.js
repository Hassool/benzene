// src/app/api/section/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose' 
import Section from '@/models/Section'
import Course from '@/models/Course'
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

  // Duration validation
  if (data.duration !== undefined) {
    if (data.duration < 1 || data.duration > 600) {
      errors.push('Section duration must be between 1 and 600 minutes');
    }
  }

  // Order validation
  if (data.order !== undefined && data.order < 1) {
    errors.push('Section order must be at least 1');
  }

  // Course ownership validation (for create/update operations)
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

// Custom POST handler with teacher authentication
export async function POST(req) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const data = await req.json();
    
    // Verify user owns the course
    const course = await Course.findById(data.courseId);
    if (!course || course.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Course not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to add sections to this course' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set default values
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
    
    return routes.POST(req, connectDB, data);
    
  } catch (error) {
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

// Custom GET handler with enhanced filtering
export async function GET(req) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const courseId = url.searchParams.get('courseId');
    const published = url.searchParams.get('published');
    const includeResources = url.searchParams.get('includeResources') === 'true';
    const includeProgress = url.searchParams.get('includeProgress') === 'true';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50);

    const session = await getServerSession();

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

      // Include progress if user is authenticated and requested
      if (includeProgress && session?.user?.id) {
        query = query.populate({
          path: 'progress',
          match: { userId: session.user.id },
          select: 'isCompleted completedAt progress'
        });
      }
      
      query = query.populate('course', 'title teacherId');

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
      .populate('course', 'title teacherId')
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

    // Include progress if user is authenticated and requested
    if (includeProgress && session?.user?.id) {
      findQuery = findQuery.populate({
        path: 'progress',
        match: { userId: session.user.id },
        select: 'isCompleted completedAt progress'
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

// Custom PATCH handler with ownership verification
export async function PATCH(req) {
  try {
    const session = await getServerSession();
    
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

    // Check if section exists and user owns the course
    const section = await Section.findById(id).populate('course');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!section.course || !section.course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to edit this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.PATCH(req, connectDB);

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

// Custom DELETE handler with ownership verification
export async function DELETE(req) {
  try {
    const session = await getServerSession();
    
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

    // Check if section exists and user owns the course
    const section = await Section.findById(id).populate('course');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!section.course || !section.course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.DELETE(req, connectDB);

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
// src/app/api/course/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose' 
import Course from '@/models/Course'
import User from '@/models/User'
import { createCrudRoutes } from '@/lib/crudHandler'

const requiredFields = ['title', 'description', 'category', 'level', 'duration', 'price']

// Custom validation function for course-specific rules
const courseValidation = async (data, operation) => {
  const errors = [];

  // Title validation
  if (data.title) {
    if (data.title.length < 3 || data.title.length > 100) {
      errors.push('Course title must be between 3 and 100 characters');
    }
  }

  // Description validation
  if (data.description) {
    if (data.description.length < 10 || data.description.length > 1000) {
      errors.push('Course description must be between 10 and 1000 characters');
    }
  }

  // Category validation
  const validCategories = ['programming', 'design', 'business', 'marketing', 'science', 'mathematics', 'language', 'other'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push('Invalid course category');
  }

  // Level validation
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (data.level && !validLevels.includes(data.level)) {
    errors.push('Course level must be beginner, intermediate, or advanced');
  }

  // Duration validation
  if (data.duration !== undefined) {
    if (data.duration < 1 || data.duration > 500) {
      errors.push('Course duration must be between 1 and 500 hours');
    }
  }

  // Price validation
  if (data.price !== undefined) {
    if (data.price < 0) {
      errors.push('Course price cannot be negative');
    }
  }

  // Learning objectives validation
  if (data.learningObjectives) {
    if (!Array.isArray(data.learningObjectives) || data.learningObjectives.length === 0) {
      errors.push('At least one learning objective is required');
    }
  }

  // Tags validation
  if (data.tags) {
    if (Array.isArray(data.tags) && data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Course validation failed' : 'Valid',
    errors
  };
};

// Enhanced CRUD route options for courses
const routeOptions = {
  excludeFromResponse: [],
  allowPartialUpdate: true,
  enableSoftDelete: true,
  customValidation: courseValidation,
  requireAuth: true // Custom flag for authentication requirement
};

const routes = createCrudRoutes(Course, requiredFields, routeOptions);

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
    
    // Verify user is a teacher
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'teacher') {
      return new Response(
        JSON.stringify({ success: false, msg: 'Only teachers can create courses' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    
    // Set teacherId from authenticated user
    data.teacherId = session.user.id;
    
    // Set default values
    data.isPublished = data.isPublished || false;
    data.enrollmentCount = 0;
    data.rating = { average: 0, count: 0 };
    
    return routes.POST(req, connectDB, data);
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error creating course', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Custom GET handler with enhanced filtering and search
export async function GET(req) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const teacherId = url.searchParams.get('teacherId');
    const category = url.searchParams.get('category');
    const level = url.searchParams.get('level');
    const search = url.searchParams.get('search');
    const published = url.searchParams.get('published');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const tags = url.searchParams.get('tags')?.split(',');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50);

    if (id) {
      // Get single course with teacher info
      const course = await Course.findById(id)
        .populate('teacher', 'fullName phoneNumber')
        .populate({
          path: 'sections',
          match: { isPublished: true, isActive: true, isDeleted: false },
          options: { sort: { order: 1 } },
          select: 'title description order duration'
        });

      if (!course || course.isDeleted) {
        return new Response(
          JSON.stringify({ success: false, msg: 'Course not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          msg: 'Course retrieved successfully',
          data: course
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query for multiple courses
    let query = { isActive: true, isDeleted: false };

    if (teacherId) {
      query.teacherId = teacherId;
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (published !== null && published !== undefined) {
      query.isPublished = published === 'true';
    }

    if (minPrice !== null && minPrice !== undefined) {
      query.price = { $gte: parseFloat(minPrice) };
    }

    if (maxPrice !== null && maxPrice !== undefined) {
      query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('teacher', 'fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query)
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
        msg: 'Courses retrieved successfully',
        data: courses,
        ...meta
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error retrieving courses', 
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
        JSON.stringify({ success: false, msg: 'Course ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if course exists and user is the teacher
    const course = await Course.findById(id);
    if (!course || course.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Course not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to edit this course' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.PATCH(req, connectDB);

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error updating course', 
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
        JSON.stringify({ success: false, msg: 'Course ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if course exists and user is the teacher
    const course = await Course.findById(id);
    if (!course || course.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Course not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this course' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.DELETE(req, connectDB);

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error deleting course', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
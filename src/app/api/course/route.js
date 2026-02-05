// src/app/api/course/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route' // Adjust this path to your NextAuth config
import connectDB from '@/lib/mongoose' 
import Course from '../../../models/Course'
import User from '../../../models/User'

const requiredFields = ['title', 'description', 'category', 'module']

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

  // Category validation (updated for Algerian educational system)
  const validCategories = ['1as', '2as', '3as', 'other'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push('Invalid course category. Must be: 1as, 2as, 3as, or other');
  }

  // Module validation (required field)
  if (data.module) {
    if (data.module.length < 2 || data.module.length > 50) {
      errors.push('Course module must be between 2 and 50 characters');
    }
  }

  // Thumbnail validation
  if (data.thumbnail) {
    const thumbnailRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!thumbnailRegex.test(data.thumbnail)) {
      errors.push('Thumbnail must be a valid image URL (jpg, jpeg, png, gif, webp)');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Course validation failed' : 'Valid',
    errors
  };
};

// Custom POST handler with authentication
export async function POST(req) {
  try {
    // IMPORTANT: Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    

    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication required. Please log in.',
          error: 'UNAUTHORIZED',
          debug: {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasUserId: !!session?.user?.id
          }
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    // Verify user exists and is active
    const user = await User.findById(session.user.id);
    if (!user || !user.isActive || user.isDeleted) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User not found or inactive',
          error: 'USER_INACTIVE' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'VALIDATION_ERROR',
          missingFields 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Custom validation
    const validation = await courseValidation(data, 'create');
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: validation.message,
          error: 'VALIDATION_ERROR',
          errors: validation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Set userID from authenticated user
    data.userID = session.user.id;
    
    // Set default values
    data.isPublished = data.isPublished || false;
    data.enrollmentCount = 0;
    data.rating = { average: 0, count: 0 };
    data.isActive = true;
    data.isDeleted = false;
    
    // Normalize category and level to lowercase
    if (data.category) data.category = data.category.toLowerCase();
    if (data.level) data.level = data.level.toLowerCase();
    if (data.module) data.module = data.module.toLowerCase();
    
    const course = new Course(data);
    await course.save();
    
    // Populate user information before returning
    await course.populate('userID', 'fullName phoneNumber email');
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Course created successfully',
        data: course
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Course creation error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error creating course',
        error: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Enhanced GET handler with advanced filtering and search
export async function GET(req) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const userID = url.searchParams.get('userID');
    const category = url.searchParams.get('category');
    const module = url.searchParams.get('module');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = Math.max(parseInt(url.searchParams.get('page')) || 1, 1);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit')) || 10, 1), 50);

    if (id) {
      // Get single course with detailed user info
      const course = await Course.findById(id)
        .populate('userID', 'fullName phoneNumber email createdAt')
        .lean();

      if (!course || course.isDeleted) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Course not found',
            error: 'NOT_FOUND' 
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Course retrieved successfully',
          data: course
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query for multiple courses
    let query = { isActive: true, isDeleted: false };

    // Filter by user
    if (userID) {
      query.userID = userID;
    }

    // Filter by category
    if (category) {
      query.category = category.toLowerCase();
    }

    // Filter by module
    if (module) {
      query.module = { $regex: module, $options: 'i' };
    }

    // Search functionality across multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { module: searchRegex }
      ];
    }

    const skip = (page - 1) * limit;
    
    // Validate sort field
    const allowedSortFields = ['title', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort = { [sortField]: sortOrder };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('userID', 'fullName phoneNumber email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);
    
    const pagination = {
      page,
      limit,
      total,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };

    // Get category statistics for additional insights
    const categoryStats = await Course.aggregate([
      { $match: { isActive: true, isDeleted: false, isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Courses retrieved successfully',
        data: courses,
        pagination,
        statistics: {
          categories: categoryStats,
          totalActive: total
        },
        filters: {
          category,
          module,
          search
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Course retrieval error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error retrieving courses',
        error: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Enhanced PATCH handler with comprehensive ownership and validation checks
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication required',
          error: 'UNAUTHORIZED' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course ID is required',
          error: 'MISSING_ID' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if course exists and user has permission
    const course = await Course.findById(id);
    if (!course || course.isDeleted) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course not found',
          error: 'NOT_FOUND' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not authorized to edit this course',
          error: 'FORBIDDEN' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData = await req.json();
    
    // Remove fields that shouldn't be updated directly
    delete updateData.userID;
    delete updateData._id;
    delete updateData.createdAt;

    // Custom validation for update
    const validation = await courseValidation(updateData, 'update');
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: validation.message,
          error: 'VALIDATION_ERROR',
          errors: validation.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Normalize fields
    if (updateData.category) updateData.category = updateData.category.toLowerCase();
    if (updateData.module) updateData.module = updateData.module.toLowerCase();

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userID', 'fullName phoneNumber email');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Course update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error updating course',
        error: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Enhanced DELETE handler with soft delete and comprehensive checks
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authentication required',
          error: 'UNAUTHORIZED' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const hardDelete = url.searchParams.get('hard') === 'true';
    
    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course ID is required',
          error: 'MISSING_ID' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if course exists and user has permission
    const course = await Course.findById(id);
    if (!course) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course not found',
          error: 'NOT_FOUND' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (course.isDeleted && !hardDelete) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course already deleted',
          error: 'ALREADY_DELETED' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not authorized to delete this course',
          error: 'FORBIDDEN' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let result;
    if (hardDelete) {
      // Permanent deletion (use with caution)
      result = await Course.findByIdAndDelete(id);
    } else {
      // Soft delete
      result = await Course.findByIdAndUpdate(
        id,
        { 
          isDeleted: true, 
          isActive: false, 
          isPublished: false,
          deletedAt: new Date() 
        },
        { new: true }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: hardDelete ? 'Course permanently deleted' : 'Course deleted successfully',
        data: { id, deletedAt: new Date() }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Course deletion error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error deleting course',
        error: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
// src/app/api/resource/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose' 
import Resource from '@/models/Resource'
import Section from '@/models/Section'
import Course from '@/models/Course'
import { createCrudRoutes } from '@/lib/crudHandler'

const requiredFields = ['title', 'sectionId', 'type', 'content']

// Custom validation function for resource-specific rules
const resourceValidation = async (data, operation) => {
  const errors = [];

  // Title validation
  if (data.title) {
    if (data.title.length < 3 || data.title.length > 100) {
      errors.push('Resource title must be between 3 and 100 characters');
    }
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.push('Resource description cannot exceed 500 characters');
  }

  // Type validation
  const validTypes = ['video', 'document', 'audio', 'quiz', 'assignment', 'link', 'text', 'image'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid resource type');
  }

  // Duration validation
  if (data.duration !== undefined && data.duration < 0) {
    errors.push('Duration cannot be negative');
  }

  // Order validation
  if (data.order !== undefined && data.order < 1) {
    errors.push('Resource order must be at least 1');
  }

  // Content validation based on type
  if (data.content && data.type) {
    try {
      validateContentByType(data.type, data.content);
    } catch (error) {
      errors.push(error.message);
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Resource validation failed' : 'Valid',
    errors
  };
};

// Helper function to validate content based on resource type
const validateContentByType = (type, content) => {
  switch (type) {
    case 'video':
      if (!content.url) throw new Error('Video resources must have a URL');
      if (content.url && !/^https?:\/\/.+/.test(content.url)) {
        throw new Error('Invalid video URL format');
      }
      break;
      
    case 'document':
      if (!content.url) throw new Error('Document resources must have a URL');
      break;
      
    case 'audio':
      if (!content.url) throw new Error('Audio resources must have a URL');
      break;
      
    case 'quiz':
      if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
        throw new Error('Quiz resources must have questions');
      }
      break;
      
    case 'assignment':
      if (!content.instructions) throw new Error('Assignment resources must have instructions');
      break;
      
    case 'link':
      if (!content.url) throw new Error('Link resources must have a URL');
      if (!/^https?:\/\/.+/.test(content.url)) {
        throw new Error('Invalid link URL format');
      }
      break;
      
    case 'text':
      if (!content.content) throw new Error('Text resources must have content');
      break;
      
    case 'image':
      if (!content.url) throw new Error('Image resources must have a URL');
      break;
  }
};

// Enhanced CRUD route options for resources
const routeOptions = {
  excludeFromResponse: [],
  allowPartialUpdate: true,
  enableSoftDelete: true,
  customValidation: resourceValidation,
  requireAuth: true
};

const routes = createCrudRoutes(Resource, requiredFields, routeOptions);

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
    
    // Verify user owns the course through section
    const section = await Section.findById(data.sectionId).populate('course');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!section.course || !section.course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to add resources to this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set default values
    data.isPublished = data.isPublished || false;
    data.isRequired = data.isRequired !== undefined ? data.isRequired : true;
    data.downloadable = data.downloadable || false;
    data.interactions = { views: 0, likes: 0, downloads: 0 };
    
    return routes.POST(req, connectDB, data);
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error creating resource', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Custom GET handler with enhanced filtering and access control
export async function GET(req) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const sectionId = url.searchParams.get('sectionId');
    const type = url.searchParams.get('type');
    const published = url.searchParams.get('published');
    const freeOnly = url.searchParams.get('freeOnly') === 'true';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50);

    if (id) {
      // Get single resource
      const resource = await Resource.findById(id)
        .populate({
          path: 'section',
          populate: {
            path: 'course',
            select: 'title teacherId'
          }
        });

      if (!resource || resource.isDeleted) {
        return new Response(
          JSON.stringify({ success: false, msg: 'Resource not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check access permissions for non-free resources
      const session = await getServerSession();
      if (!resource.isFree && resource.section && resource.section.course) {
        const canAccess = await resource.canAccess(session?.user?.id);
        if (!canAccess) {
          return new Response(
            JSON.stringify({ success: false, msg: 'Access denied to this resource' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Increment view count if accessing content
      if (session?.user?.id) {
        await resource.incrementViews();
      }

      return new Response(
        JSON.stringify({
          success: true,
          msg: 'Resource retrieved successfully',
          data: resource
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query for multiple resources
    let query = { isActive: true, isDeleted: false };

    if (sectionId) {
      query.sectionId = sectionId;
    }

    if (type) {
      query.type = type;
    }

    if (published !== null && published !== undefined) {
      query.isPublished = published === 'true';
    }

    if (freeOnly) {
      query.isFree = true;
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate({
          path: 'section',
          select: 'title courseId',
          populate: {
            path: 'course',
            select: 'title teacherId'
          }
        })
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query)
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
        msg: 'Resources retrieved successfully',
        data: resources,
        ...meta
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error retrieving resources', 
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
        JSON.stringify({ success: false, msg: 'Resource ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resource exists and user owns the course
    const resource = await Resource.findById(id)
      .populate({
        path: 'section',
        populate: {
          path: 'course'
        }
      });

    if (!resource || resource.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Resource not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!resource.section?.course || !resource.section.course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to edit this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.PATCH(req, connectDB);

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error updating resource', 
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
        JSON.stringify({ success: false, msg: 'Resource ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resource exists and user owns the course
    const resource = await Resource.findById(id)
      .populate({
        path: 'section',
        populate: {
          path: 'course'
        }
      });

    if (!resource || resource.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Resource not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!resource.section?.course || !resource.section.course.canEdit(session.user.id)) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return routes.DELETE(req, connectDB);

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        msg: 'Error deleting resource', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
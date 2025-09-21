// src/app/api/resource/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route' // ✅ Import authOptions
import connectDB from '@/lib/mongoose' 
import Resource from '../../../models/Resource'
import Section from '../../../models/Section'
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
      // For video, content can be a string URL or an object with url property
      const videoUrl = typeof content === 'string' ? content : content?.url;
      if (!videoUrl) throw new Error('Video resources must have a URL');
      if (!/^https?:\/\/.+/.test(videoUrl)) {
        throw new Error('Invalid video URL format');
      }
      break;
      
    case 'document':
      const docUrl = typeof content === 'string' ? content : content?.url;
      if (!docUrl) throw new Error('Document resources must have a URL');
      break;
      
    case 'audio':
      const audioUrl = typeof content === 'string' ? content : content?.url;
      if (!audioUrl) throw new Error('Audio resources must have a URL');
      break;
      
    case 'quiz':
      // For quiz, content structure is flexible - can be handled by Quiz model
      break;
      
    case 'assignment':
      const instructions = typeof content === 'string' ? content : content?.instructions;
      if (!instructions) throw new Error('Assignment resources must have instructions');
      break;
      
    case 'link':
      const linkUrl = typeof content === 'string' ? content : content?.url;
      if (!linkUrl) throw new Error('Link resources must have a URL');
      if (!/^https?:\/\/.+/.test(linkUrl)) {
        throw new Error('Invalid link URL format');
      }
      break;
      
    case 'text':
      const textContent = typeof content === 'string' ? content : content?.content;
      if (!textContent) throw new Error('Text resources must have content');
      break;
      
    case 'image':
      const imageUrl = typeof content === 'string' ? content : content?.url;
      if (!imageUrl) throw new Error('Image resources must have a URL');
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
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    console.log('Resource POST - Session check:', { 
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
    console.log('Creating resource with data:', { 
      title: data.title, 
      type: data.type, 
      sectionId: data.sectionId 
    });
    
    // Verify section exists and user owns the course through section
    const section = await Section.findById(data.sectionId).populate('courseId');
    if (!section || section.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Section not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can edit the course (assuming courseId has userID field)
    if (section.courseId?.userID && section.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to add resources to this section' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set default values with user ID
    data.isPublished = data.isPublished || false;
    data.isRequired = data.isRequired !== undefined ? data.isRequired : true;
    data.downloadable = data.downloadable || false;
    data.interactions = { views: 0, likes: 0, downloads: 0 };
    data.isActive = true;
    data.isDeleted = false;
    data.createdBy = session.user.id;
    
    // If no order is specified, set it to the next available order
    if (!data.order) {
      const maxOrder = await Resource.findOne({ sectionId: data.sectionId })
        .sort({ order: -1 })
        .select('order');
      data.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    // Create resource
    const resource = new Resource(data);
    await resource.save();
    
    console.log('Resource created successfully:', resource._id);
    
    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Resource created successfully',
        data: resource
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Resource creation error:', error);
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
          path: 'sectionId',
          populate: {
            path: 'courseId',
            select: 'title userID'
          }
        });

      if (!resource || resource.isDeleted) {
        return new Response(
          JSON.stringify({ success: false, msg: 'Resource not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check access permissions for non-free resources
      // ✅ Pass authOptions to getServerSession
      const session = await getServerSession(authOptions);
      if (!resource.isFree && resource.sectionId && resource.sectionId.courseId) {
        // Simple access check - you can enhance this based on your business logic
        if (!session?.user?.id) {
          return new Response(
            JSON.stringify({ success: false, msg: 'Authentication required to access this resource' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Increment view count if accessing content
      if (session?.user?.id && resource.interactions) {
        resource.interactions.views = (resource.interactions.views || 0) + 1;
        await resource.save();
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
          path: 'sectionId',
          select: 'title courseId',
          populate: {
            path: 'courseId',
            select: 'title userID'
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
    console.error('GET resources error:', error);
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
        JSON.stringify({ success: false, msg: 'Resource ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resource exists and user owns the course
    const resource = await Resource.findById(id)
      .populate({
        path: 'sectionId',
        populate: {
          path: 'courseId'
        }
      });

    if (!resource || resource.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Resource not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (resource.sectionId?.courseId?.userID && resource.sectionId.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to edit this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    
    // Update resource
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Resource updated successfully',
        data: updatedResource
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('PATCH resource error:', error);
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
        JSON.stringify({ success: false, msg: 'Resource ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resource exists and user owns the course
    const resource = await Resource.findById(id)
      .populate({
        path: 'sectionId',
        populate: {
          path: 'courseId'
        }
      });

    if (!resource || resource.isDeleted) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Resource not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (resource.sectionId?.courseId?.userID && resource.sectionId.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete
    await Resource.findByIdAndUpdate(id, { 
      isDeleted: true, 
      isActive: false,
      deletedAt: new Date() 
    });

    return new Response(
      JSON.stringify({
        success: true,
        msg: 'Resource deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DELETE resource error:', error);
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
// src/app/api/deleteResource/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import Course from '@/models/Course'
import Resource from '@/models/Resource'
import Quiz from '@/models/Quiz'
import { deleteFromUrl } from '@/lib/deleteAsset'

/**
 * Helper function to check if URL is from Cloudinary
 */
const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * Helper function to extract URL from content based on resource type
 */
const extractUrlFromContent = (content, type) => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    return content.url || content.src || null;
  }
  
  return null;
};

/**
 * Delete all quizzes associated with a resource
 */
const deleteResourceQuizzes = async (resourceId) => {
  try {

    const deleteResult = await Quiz.deleteMany({ ResourceID: resourceId });

    return deleteResult.deletedCount;
  } catch (error) {
    console.error(`Error deleting quizzes for resource ${resourceId}:`, error);
    throw error;
  }
};

/**
 * DELETE handler for resource deletion
 */
export async function DELETE(req) {
  try {
    // Authentication check
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
    
    // Extract resource ID from request
    const url = new URL(req.url);
    const resourceId = url.searchParams.get('id');
    
    if (!resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Resource ID is required',
          error: 'MISSING_RESOURCE_ID' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find and verify resource exists
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Resource not found',
          error: 'RESOURCE_NOT_FOUND' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find the course to check user permissions
    const course = await Course.findById(resource.courseId);
    
    if (!course) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Associated course not found',
          error: 'COURSE_NOT_FOUND' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user owns the course OR is an admin
    const isOwner = course.userID.toString() === session.user.id;
    const isAdmin = session.user.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not authorized to delete this resource',
          error: 'FORBIDDEN' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }




    
    // Initialize deletion statistics
    const deletionStats = {
      resourcesDeleted: 0,
      quizzesDeleted: 0,
      cloudinaryAssetsDeleted: 0
    };

    // Step 1: Delete quizzes if resource type is quiz
    if (resource.type === 'quiz') {
      try {
        const quizzesDeleted = await deleteResourceQuizzes(resourceId);
        deletionStats.quizzesDeleted = quizzesDeleted;

      } catch (quizError) {
        console.error(`Failed to delete quizzes for resource ${resourceId}:`, quizError);
        // Continue with resource deletion even if quiz deletion fails
      }
    }

    // Step 2: Handle Cloudinary assets for video, image, document, and audio types
    if (['video', 'image', 'document', 'audio'].includes(resource.type)) {
      const url = extractUrlFromContent(resource.content, resource.type);
      
      if (url && isCloudinaryUrl(url)) {
        try {

          await deleteFromUrl(url);

          deletionStats.cloudinaryAssetsDeleted = 1;
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary asset ${url}:`, cloudinaryError);
          // Continue with resource deletion even if Cloudinary deletion fails
        }
      }
    }
    
    // Step 3: Delete the resource itself
    const resourceDeleteResult = await Resource.findByIdAndDelete(resourceId);
    
    if (resourceDeleteResult) {
      deletionStats.resourcesDeleted = 1;

    }

    // Return success response with deletion statistics
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Resource and all associated data deleted successfully',
        data: {
          resourceId: resourceId,
          resourceTitle: resource.title || 'Untitled',
          resourceType: resource.type,
          courseId: resource.courseId,
          courseTitle: course.title,
          deletedAt: new Date().toISOString(),
          statistics: deletionStats
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resource deletion error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error deleting resource',
        error: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Only allow DELETE method
export async function GET(req) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'Method not allowed. Use DELETE request.',
      error: 'METHOD_NOT_ALLOWED' 
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(req) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'Method not allowed. Use DELETE request.',
      error: 'METHOD_NOT_ALLOWED' 
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function PATCH(req) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'Method not allowed. Use DELETE request.',
      error: 'METHOD_NOT_ALLOWED' 
    }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
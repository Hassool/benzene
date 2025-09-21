// src/app/api/deleteSection/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import Course from '@/models/Course'
import Section from '@/models/Section'
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
    console.log(`Deleting quizzes for resource: ${resourceId}`);
    const deleteResult = await Quiz.deleteMany({ ResourceID: resourceId });
    console.log(`Deleted ${deleteResult.deletedCount} quizzes for resource ${resourceId}`);
    return deleteResult.deletedCount;
  } catch (error) {
    console.error(`Error deleting quizzes for resource ${resourceId}:`, error);
    throw error;
  }
};

/**
 * Delete a single resource and its associated data
 */
const deleteResource = async (resource) => {
  try {
    console.log(`Processing resource: ${resource._id} (${resource.type})`);
    
    let quizzesDeleted = 0;
    
    // If resource type is quiz, delete all quizzes first
    if (resource.type === 'quiz') {
      quizzesDeleted = await deleteResourceQuizzes(resource._id);
    }
    
    // Handle Cloudinary assets for video, image, document, and audio types
    let cloudinaryAssetDeleted = false;
    if (['video', 'image', 'document', 'audio'].includes(resource.type)) {
      const url = extractUrlFromContent(resource.content, resource.type);
      
      if (url && isCloudinaryUrl(url)) {
        try {
          console.log(`Deleting Cloudinary asset: ${url}`);
          await deleteFromUrl(url);
          console.log(`Successfully deleted Cloudinary asset: ${url}`);
          cloudinaryAssetDeleted = true;
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary asset ${url}:`, cloudinaryError);
          // Continue with resource deletion even if Cloudinary deletion fails
        }
      }
    }
    
    // Delete the resource itself
    const deleteResult = await Resource.findByIdAndDelete(resource._id);
    console.log(`Successfully deleted resource: ${resource._id}`);
    
    return {
      resource: deleteResult,
      quizzesDeleted,
      cloudinaryAssetDeleted
    };
  } catch (error) {
    console.error(`Error deleting resource ${resource._id}:`, error);
    throw error;
  }
};

/**
 * DELETE handler for section deletion
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
    
    // Extract section ID from request
    const url = new URL(req.url);
    const sectionId = url.searchParams.get('id');
    
    if (!sectionId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Section ID is required',
          error: 'MISSING_SECTION_ID' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find and verify section exists
    const section = await Section.findById(sectionId);
    
    if (!section) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Section not found',
          error: 'SECTION_NOT_FOUND' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find the course to check user permissions
    const course = await Course.findById(section.courseId);
    
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
          message: 'Not authorized to delete this section',
          error: 'FORBIDDEN' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deletion authorized for section: ${sectionId} by ${isOwner ? 'owner' : 'admin'} (${session.user.phoneNumber})`);
    console.log(`User: ${session.user.fullName || 'Unknown'}, Admin: ${isAdmin}, Owner: ${isOwner}`);

    console.log(`Starting deletion process for section: ${sectionId} (${section.title})`);
    
    // Initialize deletion statistics
    const deletionStats = {
      sectionsDeleted: 0,
      resourcesDeleted: 0,
      quizzesDeleted: 0,
      cloudinaryAssetsDeleted: 0
    };

    // Find all resources in this section
    const resources = await Resource.find({ 
      sectionId: sectionId,
      isDeleted: false 
    });
    
    console.log(`Found ${resources.length} resources in section ${sectionId}`);
    
    if (resources.length > 0) {
      // Process each resource
      for (const resource of resources) {
        try {
          const resourceResult = await deleteResource(resource);
          deletionStats.resourcesDeleted++;
          deletionStats.quizzesDeleted += resourceResult.quizzesDeleted;
          if (resourceResult.cloudinaryAssetDeleted) {
            deletionStats.cloudinaryAssetsDeleted++;
          }
          
          console.log(`Successfully processed resource ${resource._id}`);
        } catch (resourceError) {
          console.error(`Failed to delete resource ${resource._id}:`, resourceError);
          // Continue with other resources even if one fails
        }
      }
    }

    // Finally, delete the section itself
    const sectionDeleteResult = await Section.findByIdAndDelete(sectionId);
    
    if (sectionDeleteResult) {
      deletionStats.sectionsDeleted = 1;
      console.log(`Successfully deleted section: ${sectionId}`);
    }

    // Return success response with deletion statistics
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Section and all associated data deleted successfully',
        data: {
          sectionId: sectionId,
          sectionTitle: section.title,
          courseId: section.courseId,
          courseTitle: course.title,
          deletedAt: new Date().toISOString(),
          statistics: deletionStats
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Section deletion error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error deleting section',
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
// src/app/api/deleteCourse/route.js

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
    
    // If resource type is quiz, delete all quizzes first
    if (resource.type === 'quiz') {
      await deleteResourceQuizzes(resource._id);
    }
    
    // Handle Cloudinary assets for video, image, document, and audio types
    if (['video', 'image', 'document', 'audio'].includes(resource.type)) {
      const url = extractUrlFromContent(resource.content, resource.type);
      
      if (url && isCloudinaryUrl(url)) {
        try {
          console.log(`Deleting Cloudinary asset: ${url}`);
          await deleteFromUrl(url);
          console.log(`Successfully deleted Cloudinary asset: ${url}`);
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary asset ${url}:`, cloudinaryError);
          // Continue with resource deletion even if Cloudinary deletion fails
        }
      }
    }
    
    // Delete the resource itself
    const deleteResult = await Resource.findByIdAndDelete(resource._id);
    console.log(`Successfully deleted resource: ${resource._id}`);
    
    return deleteResult;
  } catch (error) {
    console.error(`Error deleting resource ${resource._id}:`, error);
    throw error;
  }
};

/**
 * Delete a section and all its resources
 */
const deleteSection = async (section) => {
  try {
    console.log(`Processing section: ${section._id} (${section.title})`);
    
    // Find all resources in this section
    const resources = await Resource.find({ 
      sectionId: section._id,
      isDeleted: false 
    });
    
    console.log(`Found ${resources.length} resources in section ${section._id}`);
    
    // Delete all resources
    for (const resource of resources) {
      await deleteResource(resource);
    }
    
    // Delete the section itself
    const deleteResult = await Section.findByIdAndDelete(section._id);
    console.log(`Successfully deleted section: ${section._id}`);
    
    return {
      section: deleteResult,
      resourcesDeleted: resources.length
    };
  } catch (error) {
    console.error(`Error deleting section ${section._id}:`, error);
    throw error;
  }
};

/**
 * DELETE handler for complete course deletion
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
    
    // Extract course ID from request
    const url = new URL(req.url);
    const courseId = url.searchParams.get('id');
    
    if (!courseId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course ID is required',
          error: 'MISSING_COURSE_ID' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find and verify course exists and user has permission
    const course = await Course.findById(courseId);
    
    if (!course) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Course not found',
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
          message: 'Not authorized to delete this course',
          error: 'FORBIDDEN' 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deletion authorized for course: ${courseId} by ${isOwner ? 'owner' : 'admin'} (${session.user.phoneNumber})`);
    console.log(`User: ${session.user.fullName || 'Unknown'}, Admin: ${isAdmin}, Owner: ${isOwner}`);

    console.log(`Starting deletion process for course: ${courseId} (${course.title})`);
    
    // Initialize deletion statistics
    const deletionStats = {
      coursesDeleted: 0,
      sectionsDeleted: 0,
      resourcesDeleted: 0,
      quizzesDeleted: 0,
      cloudinaryAssetsDeleted: 0
    };

    // Find all sections in this course
    const sections = await Section.find({ 
      courseId: courseId,
      isDeleted: false 
    });
    
    console.log(`Found ${sections.length} sections in course ${courseId}`);
    
    if (sections.length > 0) {
      // Process each section
      for (const section of sections) {
        try {
          const sectionResult = await deleteSection(section);
          deletionStats.sectionsDeleted++;
          deletionStats.resourcesDeleted += sectionResult.resourcesDeleted;
          
          console.log(`Successfully processed section ${section._id}`);
        } catch (sectionError) {
          console.error(`Failed to delete section ${section._id}:`, sectionError);
          // Continue with other sections even if one fails
        }
      }
    }

    // Finally, delete the course itself
    const courseDeleteResult = await Course.findByIdAndDelete(courseId);
    
    if (courseDeleteResult) {
      deletionStats.coursesDeleted = 1;
      console.log(`Successfully deleted course: ${courseId}`);
    }

    // Return success response with deletion statistics
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Course and all associated data deleted successfully',
        data: {
          courseId: courseId,
          courseTitle: course.title,
          deletedAt: new Date().toISOString(),
          statistics: deletionStats
        }
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
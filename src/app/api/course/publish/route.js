// src/app/api/course/publish/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import Course from '../../../../models/Course'
import Resource from '../../../../models/Resource'

const handleError = (statusCode, message, error) => {
  console.error(message, error)
  return new Response(
    JSON.stringify({ 
      success: false,
      msg: message, 
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode, 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}

const handleSuccess = (statusCode, message, data = {}) => {
  return new Response(
    JSON.stringify({
      success: true,
      msg: message,
      data,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// PUT: Publish or unpublish a course
export async function PUT(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { courseId, publish } = await req.json()

    if (!courseId) {
      return handleError(400, 'Course ID is required')
    }

    if (typeof publish !== 'boolean') {
      return handleError(400, 'Publish status must be a boolean value')
    }

    await connectDB()

    // Find course and verify ownership
    const course = await Course.findById(courseId)
    
    if (!course || course.isDeleted || !course.isActive) {
      return handleError(404, 'Course not found')
    }

    if (!course.canEdit(session.user.id)) {
      return handleError(403, 'Not authorized to publish/unpublish this course')
    }

    // If publishing, validate course completeness
    if (publish && !course.isPublished) {
      const validationResult = await validateCourseForPublishing(courseId)
      if (!validationResult.isValid) {
        return handleError(400, 'Course cannot be published', {
          issues: validationResult.issues
        })
      }
    }

    // Update course publish status
    course.isPublished = publish
    if (publish && !course.publishedAt) {
      course.publishedAt = new Date()
    } else if (!publish) {
      course.publishedAt = null
    }

    await course.save()

    return handleSuccess(200, `Course ${publish ? 'published' : 'unpublished'} successfully`, {
      courseId,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt
    })

  } catch (error) {
    return handleError(500, `Failed to ${publish ? 'publish' : 'unpublish'} course`, error)
  }
}

// Helper function to validate course for publishing
async function validateCourseForPublishing(courseId) {
  const issues = []

  try {
    // Check if course has at least one published resource
    const publishedResources = await Resource.find({
      courseId,
      isPublished: true,
      isActive: true,
      isDeleted: false
    })

    if (publishedResources.length === 0) {
      issues.push('Course must have at least one published resource')
    }

    // Get course details (reuse existing course object if possible, but finding again for safety)
    const course = await Course.findById(courseId)

    // Check required course fields
    if (!course.title || course.title.trim().length < 3) {
      issues.push('Course must have a valid title (at least 3 characters)')
    }

    if (!course.description || course.description.trim().length < 10) {
      issues.push('Course must have a valid description (at least 10 characters)')
    }
/*
    if (!course.learningObjectives || course.learningObjectives.length === 0) {
      issues.push('Course must have at least one learning objective')
    }
*/
    if (!course.category || !['1as', '2as', '3as', 'other'].includes(course.category)) {
      issues.push('Course must have a valid category')
    }

   /* if (!course.level || !['beginner', 'intermediate', 'advanced'].includes(course.level)) {
      issues.push('Course must have a valid level')
    }

    if (!course.duration || course.duration < 1) {
      issues.push('Course must have a valid duration')
    }

    if (course.price === undefined || course.price < 0) {
      issues.push('Course must have a valid price (0 or greater)')
    }
*/
    return {
      isValid: issues.length === 0,
      issues
    }

  } catch (error) {
    return {
      isValid: false,
      issues: ['Error validating course for publishing']
    }
  }
}
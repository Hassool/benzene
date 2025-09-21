// src/app/api/section/reorder/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import Section from '../../../../models/Section'
import Course from '../../../../models/Course'

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

// PUT: Reorder sections within a course
export async function PUT(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { courseId, sectionOrders } = await req.json()

    if (!courseId) {
      return handleError(400, 'Course ID is required')
    }

    if (!sectionOrders || !Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return handleError(400, 'Section orders array is required')
    }

    // Validate section orders format
    for (const item of sectionOrders) {
      if (!item.sectionId || !item.order || item.order < 1) {
        return handleError(400, 'Each item must have sectionId and valid order (>= 1)')
      }
    }

    await connectDB()

    // Verify user owns the course
    const course = await Course.findById(courseId)
    if (!course || course.isDeleted || !course.isActive) {
      return handleError(404, 'Course not found')
    }

    if (!course.canEdit(session.user.id)) {
      return handleError(403, 'Not authorized to reorder sections in this course')
    }

    // Verify all sections belong to the course
    const sectionIds = sectionOrders.map(item => item.sectionId)
    const sections = await Section.find({
      _id: { $in: sectionIds },
      courseId: courseId,
      isDeleted: false
    })

    if (sections.length !== sectionIds.length) {
      return handleError(400, 'Some sections do not belong to this course or do not exist')
    }

    // Check for duplicate orders
    const orders = sectionOrders.map(item => item.order)
    const uniqueOrders = [...new Set(orders)]
    if (orders.length !== uniqueOrders.length) {
      return handleError(400, 'Duplicate order values are not allowed')
    }

    // Reorder sections
    await Section.reorderSections(courseId, sectionOrders)

    // Get updated sections to return
    const updatedSections = await Section.find({
      courseId,
      isDeleted: false
    }).sort({ order: 1 }).select('_id title order')

    return handleSuccess(200, 'Sections reordered successfully', {
      courseId,
      sections: updatedSections
    })

  } catch (error) {
    return handleError(500, 'Failed to reorder sections', error)
  }
}
// src/app/api/resource/reorder/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import Resource from '../../../../models/Resource'
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

// PUT: Reorder resources within a course
export async function PUT(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { courseId, resourceOrders } = await req.json()

    if (!courseId) {
      return handleError(400, 'Course ID is required')
    }

    if (!resourceOrders || !Array.isArray(resourceOrders) || resourceOrders.length === 0) {
      return handleError(400, 'Resource orders array is required')
    }

    // Validate resource orders format
    for (const item of resourceOrders) {
      if (!item.resourceId || !item.order || item.order < 1) {
        return handleError(400, 'Each item must have resourceId and valid order (>= 1)')
      }
    }

    await connectDB()

    // Verify course exists and user owns it
    const course = await Course.findById(courseId)

    if (!course || course.isDeleted || !course.isActive) {
      return handleError(404, 'Course not found')
    }

    if (course.userID && course.userID.toString() !== session.user.id) {
      return handleError(403, 'Not authorized to reorder resources in this course')
    }

    // Verify all resources belong to the course
    const resourceIds = resourceOrders.map(item => item.resourceId)
    const resources = await Resource.find({
      _id: { $in: resourceIds },
      courseId: courseId,
      isDeleted: false
    })

    if (resources.length !== resourceIds.length) {
      return handleError(400, 'Some resources do not belong to this course or do not exist')
    }

    // Check for duplicate orders
    const orders = resourceOrders.map(item => item.order)
    const uniqueOrders = [...new Set(orders)]
    if (orders.length !== uniqueOrders.length) {
      return handleError(400, 'Duplicate order values are not allowed')
    }

    // Reorder resources using bulk write
    const bulkOps = resourceOrders.map(item => ({
      updateOne: {
        filter: { _id: item.resourceId },
        update: { $set: { order: item.order } }
      }
    }))
    
    await Resource.bulkWrite(bulkOps)

    // Get updated resources to return
    const updatedResources = await Resource.find({
      courseId,
      isDeleted: false
    }).sort({ order: 1 }).select('_id title type order')

    return handleSuccess(200, 'Resources reordered successfully', {
      courseId,
      resources: updatedResources
    })

  } catch (error) {
    return handleError(500, 'Failed to reorder resources', error)
  }
}

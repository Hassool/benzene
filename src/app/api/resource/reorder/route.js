// src/app/api/resource/reorder/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import Resource from '../../../../models/Resource'
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

// PUT: Reorder resources within a section
export async function PUT(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { sectionId, resourceOrders } = await req.json()

    if (!sectionId) {
      return handleError(400, 'Section ID is required')
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

    // Verify section exists and user owns the course
    const section = await Section.findById(sectionId)
      .populate('course')

    if (!section || section.isDeleted || !section.isActive) {
      return handleError(404, 'Section not found')
    }

    if (!section.course || !section.course.canEdit(session.user.id)) {
      return handleError(403, 'Not authorized to reorder resources in this section')
    }

    // Verify all resources belong to the section
    const resourceIds = resourceOrders.map(item => item.resourceId)
    const resources = await Resource.find({
      _id: { $in: resourceIds },
      sectionId: sectionId,
      isDeleted: false
    })

    if (resources.length !== resourceIds.length) {
      return handleError(400, 'Some resources do not belong to this section or do not exist')
    }

    // Check for duplicate orders
    const orders = resourceOrders.map(item => item.order)
    const uniqueOrders = [...new Set(orders)]
    if (orders.length !== uniqueOrders.length) {
      return handleError(400, 'Duplicate order values are not allowed')
    }

    // Reorder resources
    await Resource.reorderResources(sectionId, resourceOrders)

    // Get updated resources to return
    const updatedResources = await Resource.find({
      sectionId,
      isDeleted: false
    }).sort({ order: 1 }).select('_id title type order')

    return handleSuccess(200, 'Resources reordered successfully', {
      sectionId,
      resources: updatedResources
    })

  } catch (error) {
    return handleError(500, 'Failed to reorder resources', error)
  }
}

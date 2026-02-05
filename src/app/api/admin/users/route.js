// app/api/admin/users/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'

// GET - Fetch ALL users for admin moderation (only admins can access)
export async function GET(request) {
  try {
    // Check authentication - must be admin
    const session = await getServerSession(authOptions)
    

    if (!session?.user?.isAdmin) {

      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'active', 'inactive', 'all'
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Build query based on status filter
    let query = { isDeleted: false } // Don't show deleted users
    switch (status) {
      case 'pending':
        query.isActive = false
        break
      case 'active':
        query.isActive = true
        break
      case 'inactive':
        query.isActive = false
        break
      case 'all':
      default:
        // No additional filter - get all non-deleted users
        break
    }

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('fullName phoneNumber isActive isAdmin lastLogin createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ])

    // Get status counts for admin dashboard
    const statusCounts = await Promise.all([
      User.countDocuments({ isActive: false, isDeleted: false }),
      User.countDocuments({ isActive: true, isDeleted: false }),
      User.countDocuments({ isDeleted: false })
    ])


    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statusCounts: {
        pending: statusCounts[0],
        active: statusCounts[1],
        total: statusCounts[2]
      }
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT - Activate/deactivate users (only admins can access)
export async function PUT(request) {
  try {
    // Check authentication - must be admin
    const session = await getServerSession(authOptions)
    

    if (!session?.user?.isAdmin) {

      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    const body = await request.json()
    const { userId, isActive, isAdmin } = body

    const updateData = {}
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('fullName phoneNumber isActive isAdmin lastLogin createdAt updatedAt')

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete users (only admins can access)
export async function DELETE(request) {
  try {
    // Check authentication - must be admin
    const session = await getServerSession(authOptions)
    

    if (!session?.user?.isAdmin) {

      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Soft delete by setting isDeleted to true
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, isActive: false },
      { new: true }
    ).select('fullName phoneNumber isActive isDeleted')

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
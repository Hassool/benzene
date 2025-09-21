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
    
    console.log('Admin users GET request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isAdmin: session?.user?.isAdmin,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isAdmin) {
      console.log('Unauthorized admin users request - not admin user')
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
        .select('fullName phoneNumber isActive lastLogin createdAt updatedAt')
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

    console.log('Admin fetched users:', {
      status,
      count: users.length,
      totalCount,
      requestedBy: session.user.phoneNumber
    })

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
    
    console.log('Admin users PUT request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isAdmin: session?.user?.isAdmin,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isAdmin) {
      console.log('Unauthorized admin users PUT request - not admin user')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    const body = await request.json()
    const { userId, isActive } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('fullName phoneNumber isActive lastLogin createdAt updatedAt')

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User updated by admin:', {
      userId,
      isActive,
      updatedBy: session.user.phoneNumber,
      userPhone: updatedUser.phoneNumber
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
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
    
    console.log('Admin users DELETE request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isAdmin: session?.user?.isAdmin,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isAdmin) {
      console.log('Unauthorized admin users DELETE request - not admin user')
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

    console.log('User deleted by admin:', {
      userId,
      deletedUser: deletedUser.fullName,
      userPhone: deletedUser.phoneNumber,
      deletedBy: session.user.phoneNumber
    })

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
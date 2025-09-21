// app/api/admin/letters/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import { ThankYouLetter } from '@/models/thankYouLetter'

// GET - Fetch ALL letters for moderation (only Yacine can access)
export async function GET(request) {
  try {
    // Check authentication - must be Yacine
    const session = await getServerSession(authOptions)
    
    console.log('Admin letters GET request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isYacine: session?.user?.isYacine,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isYacine) {
      console.log('Unauthorized admin letters request - not Yacine user')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'published', 'all'
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Build query based on status filter
    let query = {}
    switch (status) {
      case 'pending':
        query = { isApproved: false }
        break
      case 'approved':
        query = { isApproved: true, publish: false }
        break
      case 'published':
        query = { isApproved: true, publish: true }
        break
      case 'all':
      default:
        // No filter - get all letters
        break
    }

    const [letters, totalCount] = await Promise.all([
      ThankYouLetter.find(query)
        .select('name message borderColor image createdAt publish isApproved')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ThankYouLetter.countDocuments(query)
    ])

    // Get status counts for admin dashboard
    const statusCounts = await Promise.all([
      ThankYouLetter.countDocuments({ isApproved: false }),
      ThankYouLetter.countDocuments({ isApproved: true, publish: false }),
      ThankYouLetter.countDocuments({ isApproved: true, publish: true }),
      ThankYouLetter.countDocuments({})
    ])

    console.log('Admin fetched letters:', {
      status,
      count: letters.length,
      totalCount,
      requestedBy: session.user.phoneNumber
    })

    return NextResponse.json({
      success: true,
      data: letters,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statusCounts: {
        pending: statusCounts[0],
        approved: statusCounts[1],
        published: statusCounts[2],
        total: statusCounts[3]
      }
    })
  } catch (error) {
    console.error('Error fetching admin letters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch letters' },
      { status: 500 }
    )
  }
}
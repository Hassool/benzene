// app/api/letters/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import { ThankYouLetter } from '@/models/thankYouLetter'

// GET - Fetch all published letters (PUBLIC - no auth required)
export async function GET() {
  try {
    await connectDB()

    const letters = await ThankYouLetter.find({ isApproved: true, publish: true })
      .select('name message borderColor image createdAt publish')
      .sort({ createdAt: -1 })
      .limit(100)

    return NextResponse.json({
      success: true,
      data: letters,
      count: letters.length
    })
  } catch (error) {
    console.error('Error fetching letters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch letters' },
      { status: 500 }
    )
  }
}

// POST - Anyone can create a letter (PUBLIC - no auth required)
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, message, borderColor, image } = body

    // Validation
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message cannot exceed 1000 characters' },
        { status: 400 }
      )
    }

    // Create new letter (defaults to unpublished until approved)
    const newLetter = new ThankYouLetter({
      name: name?.trim() || 'Anonymous',
      message: message.trim(),
      borderColor: borderColor || 'hsl(145, 80%, 44%)',
      image: image?.trim() || '',
      publish: false, // 🔒 Force unpublished until Yacine approves
      isApproved: false // Add explicit approval flag
    })

    const savedLetter = await newLetter.save()

    return NextResponse.json({
      success: true,
      data: savedLetter,
      message: 'Letter submitted successfully and is awaiting approval.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating letter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create letter' },
      { status: 500 }
    )
  }
}

// PUT - Only Yacine can update moderation (approve/publish)
export async function PUT(request) {
  try {
    // Check authentication - must be Yacine
    const session = await getServerSession(authOptions)
    
    console.log('PUT request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isYacine: session?.user?.isYacine,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isYacine) {
      console.log('Unauthorized PUT request - not Yacine user')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Only Yacine can moderate letters' },
        { status: 403 }
      )
    }

    await connectDB()
    const body = await request.json()
    const { letterId, isApproved, publish } = body

    if (!letterId) {
      return NextResponse.json(
        { success: false, error: 'Letter ID is required' },
        { status: 400 }
      )
    }

    // Build update fields
    const updateFields = {}
    if (typeof isApproved !== 'undefined') updateFields.isApproved = isApproved
    if (typeof publish !== 'undefined') updateFields.publish = publish

    const updatedLetter = await ThankYouLetter.findByIdAndUpdate(
      letterId,
      updateFields,
      { new: true }
    )

    if (!updatedLetter) {
      return NextResponse.json(
        { success: false, error: 'Letter not found' },
        { status: 404 }
      )
    }

    console.log('Letter updated by Yacine:', {
      letterId,
      updates: updateFields,
      updatedBy: session.user.phoneNumber
    })

    return NextResponse.json({
      success: true,
      data: updatedLetter,
      message: 'Letter updated successfully'
    })
  } catch (error) {
    console.error('Error updating letter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update letter' },
      { status: 500 }
    )
  }
}

// DELETE - Only Yacine can delete letters
export async function DELETE(request) {
  try {
    // Check authentication - must be Yacine
    const session = await getServerSession(authOptions)
    
    console.log('DELETE request session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      isYacine: session?.user?.isYacine,
      phoneNumber: session?.user?.phoneNumber
    })

    if (!session?.user?.isYacine) {
      console.log('Unauthorized DELETE request - not Yacine user')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Only Yacine can delete letters' },
        { status: 403 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const letterId = searchParams.get('id')

    if (!letterId) {
      return NextResponse.json(
        { success: false, error: 'Letter ID is required' },
        { status: 400 }
      )
    }

    const deletedLetter = await ThankYouLetter.findByIdAndDelete(letterId)

    if (!deletedLetter) {
      return NextResponse.json(
        { success: false, error: 'Letter not found' },
        { status: 404 }
      )
    }

    console.log('Letter deleted by Yacine:', {
      letterId,
      deletedLetter: deletedLetter.name,
      deletedBy: session.user.phoneNumber
    })

    return NextResponse.json({
      success: true,
      message: 'Letter deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting letter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete letter' },
      { status: 500 }
    )
  }
}
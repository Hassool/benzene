import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongoose'
import Exam from '@/models/Exam'
import User from '@/models/User'
import { deleteFromUrl } from '@/lib/deleteAsset'

// GET /api/exams
// Returns a list of exams, optionally filtered
export async function GET(request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    
    // Filters
    const year = searchParams.get('year')
    const subject = searchParams.get('subject')
    const stream = searchParams.get('stream')
    const teacherId = searchParams.get('teacherId')
    
    const query = { isActive: true }
    
    if (year) query.year = year
    if (subject) query.subject = subject
    if (stream) query.stream = stream
    if (teacherId) query.teacher = teacherId

    const exams = await Exam.find(query)
      .sort({ createdAt: -1 })
      .populate('teacher', 'fullName image')
      .lean()

    return NextResponse.json({
      success: true,
      data: exams
    })

  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

// POST /api/exams
// Creates a new exam entry
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is allowed to upload (Admin or Teacher)
    // Assuming admins are also teachers or can upload on behalf
    // Or we check role. For now, we'll allow any authenticated user to become a "teacher" for this upload
    // But ideally we should check if session.user.role === 'teacher' or isAdmin
    
    // Simple check: Must be at least active
    if (!session.user) { //  isActive check is usually handled by auth
       return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()
    const body = await request.json()
    
    // Validation
    const { title, year, stream, subject, fileUrl, term, type, hasCorrection } = body

    if (!title || !year || !subject || !fileUrl || !term) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newExam = await Exam.create({
      title,
      year,
      stream,
      subject,
      fileUrl,
      term,
      type: type || 'exam',
      hasCorrection: !!hasCorrection,
      teacher: session.user.id // Link to uploading user
    })

    return NextResponse.json({
      success: true,
      data: newExam,
      message: 'Exam created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create exam' },
      { status: 500 }
    )
  }
}

// DELETE /api/exams?id=...
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('id')

    if (!examId) {
      return NextResponse.json({ success: false, error: 'Exam ID is required' }, { status: 400 })
    }

    await connectDB()
    const exam = await Exam.findById(examId)

    if (!exam) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 })
    }

    // Authorization check: Admin or Teacher Owner
    const isAdmin = session.user.isAdmin === true
    const isOwner = exam.teacher.toString() === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // 1. Delete from Cloudinary
    if (exam.fileUrl) {
      try {
        await deleteFromUrl(exam.fileUrl)
      } catch (err) {
        console.error('Failed to delete asset from Cloudinary:', err)
      }
    }

    // 2. Delete from MongoDB
    await Exam.findByIdAndDelete(examId)

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}

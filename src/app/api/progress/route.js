// src/app/api/progress/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import Progress from '../../../models/Progress'
import Course from '../../../models/Course'
import Section from '../../../models/Section'
import User from '../../../models/User'

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

const handleSuccess = (statusCode, message, data = {}, meta = {}) => {
  return new Response(
    JSON.stringify({
      success: true,
      msg: message,
      data,
      ...meta,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// POST: Enroll in course, update progress, submit assignment, rate content
export async function POST(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { action, courseId, sectionId, resourceId, ...data } = await req.json()

    await connectDB()

    // Verify user exists and is active
    const user = await User.findById(session.user.id)
    if (!user || !user.isActive) {
      return handleError(404, 'User not found or inactive')
    }

    switch (action) {
      case 'enroll':
        return await handleEnrollment(session.user.id, courseId)
      case 'update-progress':
        return await handleProgressUpdate(session.user.id, courseId, sectionId, data)
      case 'mark-complete':
        return await handleMarkComplete(session.user.id, courseId, sectionId, data)
      case 'submit-assignment':
        return await handleAssignmentSubmission(session.user.id, courseId, sectionId, data)
      case 'rate-content':
        return await handleContentRating(session.user.id, courseId, sectionId, data)
      case 'add-note':
        return await handleAddNote(session.user.id, courseId, sectionId, data)
      case 'bookmark':
        return await handleBookmark(session.user.id, courseId, sectionId, data.bookmarked)
      default:
        return handleError(400, 'Invalid action. Use: enroll, update-progress, mark-complete, submit-assignment, rate-content, add-note, or bookmark')
    }

  } catch (error) {
    return handleError(500, 'Progress operation failed', error)
  }
}

// Handle course enrollment
async function handleEnrollment(userId, courseId) {
  if (!courseId) {
    return handleError(400, 'Course ID is required for enrollment')
  }

  try {
    // Check if course exists and is published
    const course = await Course.findById(courseId)
    if (!course || !course.isPublished || !course.isActive || course.isDeleted) {
      return handleError(404, 'Course not found or not available for enrollment')
    }

    // Check if user is already enrolled
    const existingProgress = await Progress.findOne({ userId, courseId })
    if (existingProgress) {
      return handleError(409, 'User is already enrolled in this course')
    }

    // Enroll user in course
    const progressEntries = await Progress.enrollUser(userId, courseId)

    return handleSuccess(201, 'Successfully enrolled in course', {
      courseId,
      sectionsEnrolled: progressEntries.length,
      enrolledAt: new Date()
    })

  } catch (error) {
    return handleError(500, 'Failed to enroll in course', error)
  }
}

// Handle progress update
async function handleProgressUpdate(userId, courseId, sectionId, data) {
  const { completionPercentage, timeSpent = 0 } = data

  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  if (completionPercentage === undefined || completionPercentage < 0 || completionPercentage > 100) {
    return handleError(400, 'Completion percentage must be between 0 and 100')
  }

  try {
    const progress = await Progress.findOne({ userId, courseId, sectionId })
    if (!progress) {
      return handleError(404, 'Progress record not found. User may not be enrolled in this course')
    }

    await progress.updateProgress(completionPercentage, timeSpent)

    return handleSuccess(200, 'Progress updated successfully', {
      sectionId,
      completionPercentage: progress.completionPercentage,
      totalTimeSpent: progress.timeSpent,
      completed: progress.completed
    })

  } catch (error) {
    return handleError(500, 'Failed to update progress', error)
  }
}

// Handle marking section as complete
async function handleMarkComplete(userId, courseId, sectionId, data) {
  const { score } = data

  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  try {
    const progress = await Progress.findOne({ userId, courseId, sectionId })
    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    // Check prerequisites
    const section = await Section.findById(sectionId)
    if (section) {
      const prereqCheck = await section.checkPrerequisites(userId)
      if (!prereqCheck.met) {
        return handleError(400, 'Prerequisites not met', { 
          missing: prereqCheck.missing 
        })
      }
    }

    await progress.markCompleted(score)

    return handleSuccess(200, 'Section marked as completed', {
      sectionId,
      completedAt: progress.completedAt,
      score: progress.score,
      certificateIssued: progress.certificateIssued
    })

  } catch (error) {
    return handleError(500, 'Failed to mark section as complete', error)
  }
}

// Handle assignment submission
async function handleAssignmentSubmission(userId, courseId, sectionId, data) {
  const { files, feedback, score } = data

  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  try {
    const progress = await Progress.findOne({ userId, courseId, sectionId })
    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    const submissionData = {
      submittedAt: new Date(),
      files: files || [],
      feedback: feedback || '',
      score: score || 0,
      status: 'pending'
    }

    await progress.addSubmission(submissionData)

    return handleSuccess(200, 'Assignment submitted successfully', {
      submissionId: progress.submissions[progress.submissions.length - 1]._id,
      attempts: progress.attempts,
      status: 'pending'
    })

  } catch (error) {
    return handleError(500, 'Failed to submit assignment', error)
  }
}

// Handle content rating
async function handleContentRating(userId, courseId, sectionId, data) {
  const { rating, comment } = data

  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  if (!rating || rating < 1 || rating > 5) {
    return handleError(400, 'Rating must be between 1 and 5')
  }

  try {
    const progress = await Progress.findOne({ userId, courseId, sectionId })
    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    await progress.rateContent(rating, comment)

    return handleSuccess(200, 'Content rated successfully', {
      rating: progress.rating.value,
      comment: progress.rating.comment,
      ratedAt: progress.rating.ratedAt
    })

  } catch (error) {
    return handleError(500, 'Failed to rate content', error)
  }
}

// Handle adding notes
async function handleAddNote(userId, courseId, sectionId, data) {
  const { notes } = data

  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  if (!notes || notes.length > 1000) {
    return handleError(400, 'Notes must be provided and cannot exceed 1000 characters')
  }

  try {
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId, sectionId },
      { notes, lastAccessedAt: new Date() },
      { new: true }
    )

    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    return handleSuccess(200, 'Notes updated successfully', {
      notes: progress.notes
    })

  } catch (error) {
    return handleError(500, 'Failed to update notes', error)
  }
}

// Handle bookmarking
async function handleBookmark(userId, courseId, sectionId, bookmarked) {
  if (!courseId || !sectionId) {
    return handleError(400, 'Course ID and Section ID are required')
  }

  try {
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId, sectionId },
      { bookmarked: !!bookmarked, lastAccessedAt: new Date() },
      { new: true }
    )

    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    return handleSuccess(200, `Section ${bookmarked ? 'bookmarked' : 'unbookmarked'} successfully`, {
      bookmarked: progress.bookmarked
    })

  } catch (error) {
    return handleError(500, 'Failed to update bookmark', error)
  }
}

// GET: Get user progress, course statistics, enrolled courses
export async function GET(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    await connectDB()

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'user-progress'
    const courseId = url.searchParams.get('courseId')
    const sectionId = url.searchParams.get('sectionId')
    const status = url.searchParams.get('status') || 'all'
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50)

    switch (action) {
      case 'user-progress':
        return await getUserProgress(session.user.id, courseId)
      case 'enrolled-courses':
        return await getEnrolledCourses(session.user.id, { status, page, limit })
      case 'course-stats':
        return await getCourseStatistics(session.user.id, courseId)
      case 'bookmarks':
        return await getBookmarkedSections(session.user.id)
      case 'certificates':
        return await getUserCertificates(session.user.id)
      default:
        return handleError(400, 'Invalid action')
    }

  } catch (error) {
    return handleError(500, 'Failed to retrieve progress data', error)
  }
}

// Get user progress for a specific course
async function getUserProgress(userId, courseId) {
  if (!courseId) {
    return handleError(400, 'Course ID is required')
  }

  try {
    const progressData = await Progress.getUserCourseProgress(userId, courseId)
    
    if (!progressData.sections.length) {
      return handleError(404, 'User is not enrolled in this course')
    }

    return handleSuccess(200, 'User progress retrieved successfully', progressData)

  } catch (error) {
    return handleError(500, 'Failed to get user progress', error)
  }
}

// Get user's enrolled courses
async function getEnrolledCourses(userId, options) {
  try {
    const courses = await Progress.getUserEnrolledCourses(userId, options)
    
    const total = await Progress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$courseId' } },
      { $count: 'total' }
    ])

    const totalCount = total[0]?.total || 0
    const pages = Math.ceil(totalCount / options.limit)

    return handleSuccess(200, 'Enrolled courses retrieved successfully', courses, {
      pagination: {
        page: options.page,
        limit: options.limit,
        total: totalCount,
        pages,
        hasNext: options.page < pages,
        hasPrev: options.page > 1
      }
    })

  } catch (error) {
    return handleError(500, 'Failed to get enrolled courses', error)
  }
}

// Get course statistics (for teachers)
async function getCourseStatistics(userId, courseId) {
  if (!courseId) {
    return handleError(400, 'Course ID is required')
  }

  try {
    // Verify user owns the course
    const course = await Course.findById(courseId)
    if (!course || course.teacherId.toString() !== userId) {
      return handleError(403, 'Not authorized to view course statistics')
    }

    const stats = await Progress.getCourseStats(courseId)
    
    // Get section-wise completion rates
    const sectionStats = await Progress.aggregate([
      { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: '$sectionId',
          totalEnrollments: { $sum: 1 },
          completions: { $sum: { $cond: ['$completed', 1, 0] } },
          averageProgress: { $avg: '$completionPercentage' },
          averageTimeSpent: { $avg: '$timeSpent' }
        }
      },
      {
        $lookup: {
          from: 'sections',
          localField: '_id',
          foreignField: '_id',
          as: 'section'
        }
      },
      { $unwind: '$section' },
      {
        $project: {
          sectionTitle: '$section.title',
          sectionOrder: '$section.order',
          totalEnrollments: 1,
          completions: 1,
          completionRate: { 
            $round: [{ $multiply: [{ $divide: ['$completions', '$totalEnrollments'] }, 100] }, 2]
          },
          averageProgress: { $round: ['$averageProgress', 2] },
          averageTimeSpent: { $round: ['$averageTimeSpent', 2] }
        }
      },
      { $sort: { sectionOrder: 1 } }
    ])

    return handleSuccess(200, 'Course statistics retrieved successfully', {
      overview: stats,
      sectionStats
    })

  } catch (error) {
    return handleError(500, 'Failed to get course statistics', error)
  }
}

// Get user's bookmarked sections
async function getBookmarkedSections(userId) {
  try {
    const bookmarks = await Progress.find({
      userId,
      bookmarked: true
    })
    .populate('course', 'title thumbnail')
    .populate('section', 'title description duration')
    .sort({ lastAccessedAt: -1 })

    return handleSuccess(200, 'Bookmarked sections retrieved successfully', bookmarks)

  } catch (error) {
    return handleError(500, 'Failed to get bookmarked sections', error)
  }
}

// Get user's certificates
async function getUserCertificates(userId) {
  try {
    const certificates = await Progress.find({
      userId,
      certificateIssued: true
    })
    .populate('course', 'title teacherId')
    .populate({
      path: 'course',
      populate: {
        path: 'teacher',
        select: 'fullName'
      }
    })
    .sort({ certificateIssuedAt: -1 })

    // Group by course to get unique certificates
    const uniqueCertificates = certificates.reduce((acc, progress) => {
      if (!acc.find(cert => cert.courseId.toString() === progress.courseId.toString())) {
        acc.push({
          courseId: progress.courseId,
          courseTitle: progress.course.title,
          teacherName: progress.course.teacher?.fullName,
          certificateId: progress.certificateId,
          issuedAt: progress.certificateIssuedAt,
          completedAt: progress.completedAt
        })
      }
      return acc
    }, [])

    return handleSuccess(200, 'Certificates retrieved successfully', uniqueCertificates)

  } catch (error) {
    return handleError(500, 'Failed to get certificates', error)
  }
}

// DELETE: Unenroll from course
export async function DELETE(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    await connectDB()

    const url = new URL(req.url)
    const courseId = url.searchParams.get('courseId')

    if (!courseId) {
      return handleError(400, 'Course ID is required')
    }

    // Check if user is enrolled
    const existingProgress = await Progress.findOne({ 
      userId: session.user.id, 
      courseId 
    })

    if (!existingProgress) {
      return handleError(404, 'User is not enrolled in this course')
    }

    // Remove all progress entries for this user-course combination
    await Progress.deleteMany({ 
      userId: session.user.id, 
      courseId 
    })

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: -1 }
    })

    return handleSuccess(200, 'Successfully unenrolled from course', {
      courseId,
      unenrolledAt: new Date()
    })

  } catch (error) {
    return handleError(500, 'Failed to unenroll from course', error)
  }
}

// PATCH: Update specific progress fields
export async function PATCH(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { courseId, sectionId, ...updateData } = await req.json()

    if (!courseId || !sectionId) {
      return handleError(400, 'Course ID and Section ID are required')
    }

    await connectDB()

    // Find progress record
    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId,
      sectionId
    })

    if (!progress) {
      return handleError(404, 'Progress record not found')
    }

    // Update allowed fields
    const allowedFields = ['notes', 'bookmarked']
    const filteredData = {}
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    })

    if (Object.keys(filteredData).length === 0) {
      return handleError(400, 'No valid fields to update')
    }

    filteredData.lastAccessedAt = new Date()

    const updatedProgress = await Progress.findOneAndUpdate(
      { userId: session.user.id, courseId, sectionId },
      filteredData,
      { new: true }
    )

    return handleSuccess(200, 'Progress updated successfully', {
      sectionId,
      updatedFields: Object.keys(filteredData)
    })

  } catch (error) {
    return handleError(500, 'Failed to update progress', error)
  }
}
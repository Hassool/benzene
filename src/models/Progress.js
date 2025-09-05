// src/models/Progress.js
import mongoose from 'mongoose'


const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && user.isActive;
      },
      message: 'Invalid or inactive user'
    }
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    default: null // Can be null for section-level progress
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Completion percentage cannot be negative'],
    max: [100, 'Completion percentage cannot exceed 100']
  },
  rating: {
    value: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      default: null
    },
    comment: {
      type: String,
      maxlength: [500, 'Rating comment cannot exceed 500 characters']
    },
    ratedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for unique constraints and performance
progressSchema.index({ userId: 1, courseId: 1, sectionId: 1 }, { unique: true })
progressSchema.index({ userId: 1, courseId: 1 })
progressSchema.index({ userId: 1, completed: 1 })
progressSchema.index({ courseId: 1, completed: 1 })
progressSchema.index({ sectionId: 1, completed: 1 })
progressSchema.index({ completedAt: -1 })
progressSchema.index({ lastAccessedAt: -1 })

// Virtual for user
progressSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

// Virtual for course
progressSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
})

// Virtual for section
progressSchema.virtual('section', {
  ref: 'Section',
  localField: 'sectionId',
  foreignField: '_id',
  justOne: true
})

// Virtual for resource
progressSchema.virtual('resource', {
  ref: 'Resource',
  localField: 'resourceId',
  foreignField: '_id',
  justOne: true
})

// Pre-save middleware
progressSchema.pre('save', function(next) {
  // Set startedAt when completion percentage > 0 and startedAt is null
  if (this.completionPercentage > 0 && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Set completedAt and completed when completion reaches 100%
  if (this.completionPercentage >= 100 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  // Clear completedAt when completion drops below 100%
  if (this.completionPercentage < 100 && this.completed) {
    this.completed = false;
    this.completedAt = null;
  }
  
  // Update lastAccessedAt
  this.lastAccessedAt = new Date();
  
  next();
})

// Instance method to mark as completed
progressSchema.methods.markCompleted = async function(score = null) {
  this.completed = true;
  this.completedAt = new Date();
  this.completionPercentage = 100;
  
  if (score !== null) {
    this.score.current = score;
  }
  
  await this.save();
  
  // Check if entire course is completed
  await this.checkCourseCompletion();
}

// Instance method to update progress
progressSchema.methods.updateProgress = async function(percentage, timeSpent = 0) {
  this.completionPercentage = Math.min(100, Math.max(0, percentage));
  this.timeSpent += timeSpent;
  
  await this.save();
}

// Instance method to add submission
progressSchema.methods.addSubmission = async function(submissionData) {
  this.submissions.push(submissionData);
  this.attempts += 1;
  
  await this.save();
}

// Instance method to rate content
progressSchema.methods.rateContent = async function(rating, comment = '') {
  this.rating.value = rating;
  this.rating.comment = comment;
  this.rating.ratedAt = new Date();
  
  await this.save();
  
  // Update course rating
  await this.updateCourseRating();
}

// Instance method to check course completion
progressSchema.methods.checkCourseCompletion = async function() {
  const Section = mongoose.model('Section');
  const Progress = mongoose.model('Progress');
  
  // Get all required sections for this course
  const requiredSections = await Section.find({
    courseId: this.courseId,
    isRequired: true,
    isPublished: true,
    isActive: true,
    isDeleted: false
  });
  
  // Check if user has completed all required sections
  const completedSections = await Progress.find({
    userId: this.userId,
    courseId: this.courseId,
    completed: true
  });
  
  const allRequiredCompleted = requiredSections.every(section => 
    completedSections.some(progress => 
      progress.sectionId.toString() === section._id.toString()
    )
  );
  
  if (allRequiredCompleted) {
    // Issue certificate if not already issued
    if (!this.certificateIssued) {
      await this.issueCertificate();
    }
  }
}

// Instance method to issue certificate
progressSchema.methods.issueCertificate = async function() {
  const certificateId = `CERT-${this.courseId}-${this.userId}-${Date.now()}`;
  
  // Update all progress records for this user-course combination
  await this.constructor.updateMany(
    { userId: this.userId, courseId: this.courseId },
    {
      certificateIssued: true,
      certificateIssuedAt: new Date(),
      certificateId
    }
  );
}

// Instance method to update course rating
progressSchema.methods.updateCourseRating = async function() {
  const Course = mongoose.model('Course');
  
  // Calculate average rating for the course
  const ratingStats = await this.constructor.aggregate([
    {
      $match: {
        courseId: this.courseId,
        'rating.value': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$courseId',
        averageRating: { $avg: '$rating.value' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);
  
  if (ratingStats.length > 0) {
    const { averageRating, ratingCount } = ratingStats[0];
    
    await Course.findByIdAndUpdate(this.courseId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'rating.count': ratingCount
    });
  }
}

// Static method to get user progress for a course
progressSchema.statics.getUserCourseProgress = async function(userId, courseId) {
  const progress = await this.find({ userId, courseId })
    .populate('section', 'title order duration')
    .populate('resource', 'title type duration')
    .sort({ 'section.order': 1 });
  
  // Calculate overall course progress
  const totalSections = await mongoose.model('Section').countDocuments({
    courseId,
    isPublished: true,
    isActive: true,
    isDeleted: false
  });
  
  const completedSections = progress.filter(p => p.completed).length;
  const overallProgress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  
  const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
  
  return {
    sections: progress,
    summary: {
      totalSections,
      completedSections,
      overallProgress: Math.round(overallProgress),
      totalTimeSpent,
      isCompleted: completedSections === totalSections,
      certificateIssued: progress.some(p => p.certificateIssued),
      certificateId: progress.find(p => p.certificateId)?.certificateId
    }
  };
}

// Static method to get course statistics
progressSchema.statics.getCourseStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$courseId',
        totalEnrollments: { $sum: 1 },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
        },
        averageProgress: { $avg: '$completionPercentage' },
        totalTimeSpent: { $sum: '$timeSpent' },
        averageRating: { $avg: '$rating.value' },
        ratingCount: {
          $sum: { $cond: [{ $ne: ['$rating.value', null] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    totalTimeSpent: 0,
    averageRating: 0,
    ratingCount: 0
  };
}

// Static method to enroll user in course
progressSchema.statics.enrollUser = async function(userId, courseId) {
  const Section = mongoose.model('Section');
  
  // Get all published sections for the course
  const sections = await Section.find({
    courseId,
    isPublished: true,
    isActive: true,
    isDeleted: false
  }).sort({ order: 1 });
  
  // Create progress entry for each section
  const progressEntries = sections.map(section => ({
    userId,
    courseId,
    sectionId: section._id,
    enrolledAt: new Date()
  }));
  
  await this.insertMany(progressEntries);
  
  // Update course enrollment count
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(courseId, {
    $inc: { enrollmentCount: 1 }
  });
  
  return progressEntries;
}

// Static method to get user's enrolled courses
progressSchema.statics.getUserEnrolledCourses = async function(userId, options = {}) {
  const { page = 1, limit = 10, status = 'all' } = options;
  const skip = (page - 1) * limit;
  
  let matchStage = { userId: mongoose.Types.ObjectId(userId) };
  
  if (status === 'completed') {
    matchStage.completed = true;
  } else if (status === 'in-progress') {
    matchStage.completed = false;
    matchStage.completionPercentage = { $gt: 0 };
  } else if (status === 'not-started') {
    matchStage.completionPercentage = 0;
  }
  
  const courses = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$courseId',
        enrolledAt: { $first: '$enrolledAt' },
        lastAccessedAt: { $max: '$lastAccessedAt' },
        overallProgress: { $avg: '$completionPercentage' },
        totalTimeSpent: { $sum: '$timeSpent' },
        sectionsCompleted: {
          $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
        },
        totalSections: { $sum: 1 },
        certificateIssued: { $max: '$certificateIssued' },
        certificateId: { $first: '$certificateId' }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $lookup: {
        from: 'users',
        localField: 'course.teacherId',
        foreignField: '_id',
        as: 'teacher',
        pipeline: [{ $project: { fullName: 1, phoneNumber: 1 } }]
      }
    },
    { $unwind: '$teacher' },
    { $sort: { lastAccessedAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);
  
  return courses;
}

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema)

export default Progress
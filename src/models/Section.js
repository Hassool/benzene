// src/models/Section.js
import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    minlength: [3, 'Section title must be at least 3 characters'],
    maxlength: [100, 'Section title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Section description cannot exceed 500 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    validate: {
      validator: async function(v) {
        const Course = mongoose.model('Course');
        const course = await Course.findById(v);
        return course && course.isActive && !course.isDeleted;
      },
      message: 'Invalid or inactive course'
    }
  },
  order: {
    type: Number,
    required: [true, 'Section order is required'],
    min: [1, 'Section order must be at least 1']
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Section duration is required'],
    min: [1, 'Section duration must be at least 1 minute'],
    max: [600, 'Section duration cannot exceed 600 minutes (10 hours)']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  isFree: {
    type: Boolean,
    default: false // If true, this section is available without course enrollment
  },
  prerequisites: [{
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    completionRequired: {
      type: Boolean,
      default: true
    }
  }],
  learningObjectives: [{
    type: String,
    trim: true,
    maxlength: [150, 'Each learning objective cannot exceed 150 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound index to ensure unique order within a course
sectionSchema.index({ courseId: 1, order: 1 }, { unique: true })

// Other indexes for better query performance
sectionSchema.index({ courseId: 1, isPublished: 1, isActive: 1 })
sectionSchema.index({ isPublished: 1, isFree: 1 })

// Virtual for resources
sectionSchema.virtual('resources', {
  ref: 'Resource',
  localField: '_id',
  foreignField: 'sectionId'
})

// Virtual for course
sectionSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
})

// Virtual for progress entries
sectionSchema.virtual('progress', {
  ref: 'Progress',
  localField: '_id',
  foreignField: 'sectionId'
})

// Pre-save middleware
sectionSchema.pre('save', async function(next) {
  try {
    // Set publishedAt when section is published
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    
    // Clear publishedAt when unpublished
    if (!this.isPublished && this.publishedAt) {
      this.publishedAt = null;
    }
    
    // Auto-assign order if not provided (for new sections)
    if (this.isNew && !this.order) {
      const maxOrder = await this.constructor.findOne(
        { courseId: this.courseId },
        { order: 1 },
        { sort: { order: -1 } }
      );
      this.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    next();
  } catch (error) {
    next(error);
  }
})

// Instance method to check if user can access section
sectionSchema.methods.canAccess = async function(userId) {
  // If section is free, anyone can access
  if (this.isFree) return true;
  
  // Check if user is enrolled in the course
  const Course = mongoose.model('Course');
  const Progress = mongoose.model('Progress');
  
  const course = await Course.findById(this.courseId);
  if (!course) return false;
  
  // Check if user is the teacher of the course
  if (course.teacherId.toString() === userId.toString()) return true;
  
  // Check if user has progress entry for this course (indicating enrollment)
  const userProgress = await Progress.findOne({
    userId,
    courseId: this.courseId
  });
  
  return !!userProgress;
}

// Instance method to check if prerequisites are met
sectionSchema.methods.checkPrerequisites = async function(userId) {
  if (!this.prerequisites || this.prerequisites.length === 0) {
    return { met: true, missing: [] };
  }
  
  const Progress = mongoose.model('Progress');
  const missing = [];
  
  for (const prereq of this.prerequisites) {
    if (prereq.completionRequired) {
      const progress = await Progress.findOne({
        userId,
        sectionId: prereq.sectionId,
        completed: true
      });
      
      if (!progress) {
        const Section = mongoose.model('Section');
        const section = await Section.findById(prereq.sectionId);
        missing.push({
          sectionId: prereq.sectionId,
          title: section?.title || 'Unknown Section'
        });
      }
    }
  }
  
  return {
    met: missing.length === 0,
    missing
  };
}

// Static method to get sections by course
sectionSchema.statics.findByCourse = function(courseId, options = {}) {
  const { includeUnpublished = false, includeInactive = false } = options;
  
  const query = { courseId, isDeleted: false };
  
  if (!includeUnpublished) {
    query.isPublished = true;
  }
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query)
    .populate('course', 'title teacherId')
    .sort({ order: 1 });
}

// Static method to reorder sections
sectionSchema.statics.reorderSections = async function(courseId, sectionOrders) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      for (const { sectionId, order } of sectionOrders) {
        await this.findByIdAndUpdate(
          sectionId,
          { order },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }
}

const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema)

export default Section
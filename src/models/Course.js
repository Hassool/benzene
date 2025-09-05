// src/models/Course.js
import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [3, 'Course title must be at least 3 characters'],
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    minlength: [10, 'Course description must be at least 10 characters'],
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const teacher = await User.findById(v);
        return teacher && teacher.role === 'teacher';
      },
      message: 'Only users with teacher role can create courses'
    }
  },
  thumbnail: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Thumbnail must be a valid image URL'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
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

// Indexes for better query performance
courseSchema.index({ teacherId: 1 })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ isPublished: 1, isActive: 1 })
courseSchema.index({ tags: 1 })
courseSchema.index({ 'rating.average': -1 })
courseSchema.index({ createdAt: -1 })

// Virtual for sections
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'courseId'
})

// Virtual for teacher info
courseSchema.virtual('teacher', {
  ref: 'User',
  localField: 'teacherId',
  foreignField: '_id',
  justOne: true
})

// Pre-save middleware
courseSchema.pre('save', function(next) {
  // Set publishedAt when course is published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Clear publishedAt when unpublished
  if (!this.isPublished && this.publishedAt) {
    this.publishedAt = null;
  }
  
  next();
})

// Instance method to check if user can edit course
courseSchema.methods.canEdit = function(userId) {
  return this.teacherId.toString() === userId.toString();
}

// Static method to get courses by teacher
courseSchema.statics.findByTeacher = function(teacherId, options = {}) {
  const { includeUnpublished = false, page = 1, limit = 10 } = options;
  
  const query = { teacherId, isActive: true, isDeleted: false };
  if (!includeUnpublished) {
    query.isPublished = true;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .populate('teacher', 'fullName phoneNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

// Static method to search courses
courseSchema.statics.searchCourses = function(searchQuery, filters = {}) {
  const { category, level, minPrice, maxPrice, tags } = filters;
  
  let query = {
    isPublished: true,
    isActive: true,
    isDeleted: false
  };
  
  // Text search
  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { tags: { $regex: searchQuery, $options: 'i' } }
    ];
  }
  
  // Filters
  if (category) query.category = category;
  if (level) query.level = level;
  if (minPrice !== undefined) query.price = { $gte: minPrice };
  if (maxPrice !== undefined) {
    query.price = { ...query.price, $lte: maxPrice };
  }
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  return this.find(query)
    .populate('teacher', 'fullName')
    .sort({ 'rating.average': -1, enrollmentCount: -1 });
}

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)

export default Course
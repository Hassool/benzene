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
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['1as', '2as', '3as', 'other'],
    lowercase: true
  },
  module: {
    type: String,
    required: [true, 'Course module is required'],
    lowercase: true
  },
  // Changed from teacherId to userID to relate to any user
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: async function(v) {
        const User = mongoose.model('User');
        const user = await User.findById(v);
        return user && user.isActive && !user.isDeleted;
      },
      message: 'Invalid or inactive user'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0
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
  }
}, {
  timestamps: true
})

// Virtual to populate user information
courseSchema.virtual('user', {
  ref: 'User',
  localField: 'userID',
  foreignField: '_id',
  justOne: true
})

// Method to check if a user can edit this course
courseSchema.methods.canEdit = function(userId) {
  return this.userID.toString() === userId.toString()
}

// Index for better performance
courseSchema.index({ userID: 1 })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ isPublished: 1, isActive: 1, isDeleted: 1 })
courseSchema.index({ createdAt: -1 })

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema)

export default Course
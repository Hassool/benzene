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
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Section order must be at least 1']
  }
})

const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema)

export default Section
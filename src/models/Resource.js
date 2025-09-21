// src/models/Resource.js
import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    minlength: [3, 'Resource title must be at least 3 characters'],
    maxlength: [100, 'Resource title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Resource description cannot exceed 500 characters']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required'],
    validate: {
      validator: async function(v) {
        const Section = mongoose.model('Section');
        const section = await Section.findById(v);
        return section && section.isActive && !section.isDeleted;
      },
      message: 'Invalid or inactive section'
    }
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: {
      values: ['video', 'document', 'quiz', 'link', 'image'],
      message: 'Invalid resource type'
    }
  },
  content: {
    type: String,
    default: ""
  },
  order: {
    type: Number,
    required: [true, 'Resource order is required'],
    min: [1, 'Resource order must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  }
})

// Compound index to ensure unique order within a section
resourceSchema.index({ sectionId: 1, order: 1 }, { unique: true })

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema)

export default Resource
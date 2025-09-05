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
      values: ['video', 'document', 'audio', 'quiz', 'assignment', 'link', 'text', 'image'],
      message: 'Invalid resource type'
    }
  },
  content: {
    // For different resource types:
    // video: { url, duration, thumbnail }
    // document: { url, fileSize, fileType }
    // audio: { url, duration }
    // quiz: { questions, timeLimit, passingScore }
    // assignment: { instructions, dueDate, maxScore }
    // link: { url, description }
    // text: { content }
    // image: { url, caption }
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Resource content is required']
  },
  order: {
    type: Number,
    required: [true, 'Resource order is required'],
    min: [1, 'Resource order must be at least 1']
  },
  duration: {
    type: Number, // Duration in minutes (for video/audio) or estimated time for completion
    min: [0, 'Duration cannot be negative'],
    default: 0
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
    default: false // If true, this resource is accessible without enrollment
  },
  isRequired: {
    type: Boolean,
    default: true // If true, this resource must be completed to complete the section
  },
  downloadable: {
    type: Boolean,
    default: false
  },
  fileInfo: {
    originalName: String,
    mimeType: String,
    size: Number, // Size in bytes
    uploadDate: Date
  },
  interactions: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
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

// Compound index to ensure unique order within a section
resourceSchema.index({ sectionId: 1, order: 1 }, { unique: true })

// Other indexes for better query performance
resourceSchema.index({ sectionId: 1, isPublished: 1, isActive: 1 })
resourceSchema.index({ type: 1, isPublished: 1 })
resourceSchema.index({ isFree: 1, isPublished: 1 })

// Virtual for section
resourceSchema.virtual('section', {
  ref: 'Section',
  localField: 'sectionId',
  foreignField: '_id',
  justOne: true
})

// Pre-save middleware
resourceSchema.pre('save', async function(next) {
  try {
    // Set publishedAt when resource is published
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    
    // Clear publishedAt when unpublished
    if (!this.isPublished && this.publishedAt) {
      this.publishedAt = null;
    }
    
    // Auto-assign order if not provided (for new resources)
    if (this.isNew && !this.order) {
      const maxOrder = await this.constructor.findOne(
        { sectionId: this.sectionId },
        { order: 1 },
        { sort: { order: -1 } }
      );
      this.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    // Validate content based on type
    this.validateContentByType();
    
    next();
  } catch (error) {
    next(error);
  }
})

// Instance method to validate content based on resource type
resourceSchema.methods.validateContentByType = function() {
  const { type, content } = this;
  
  switch (type) {
    case 'video':
      if (!content.url) {
        throw new Error('Video resources must have a URL');
      }
      break;
      
    case 'document':
      if (!content.url) {
        throw new Error('Document resources must have a URL');
      }
      break;
      
    case 'audio':
      if (!content.url) {
        throw new Error('Audio resources must have a URL');
      }
      break;
      
    case 'quiz':
      if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
        throw new Error('Quiz resources must have questions');
      }
      break;
      
    case 'assignment':
      if (!content.instructions) {
        throw new Error('Assignment resources must have instructions');
      }
      break;
      
    case 'link':
      if (!content.url) {
        throw new Error('Link resources must have a URL');
      }
      break;
      
    case 'text':
      if (!content.content) {
        throw new Error('Text resources must have content');
      }
      break;
      
    case 'image':
      if (!content.url) {
        throw new Error('Image resources must have a URL');
      }
      break;
  }
}

// Instance method to check if user can access resource
resourceSchema.methods.canAccess = async function(userId) {
  // If resource is free, anyone can access
  if (this.isFree) return true;
  
  // Check section access
  const Section = mongoose.model('Section');
  const section = await Section.findById(this.sectionId);
  if (!section) return false;
  
  return await section.canAccess(userId);
}

// Instance method to increment view count
resourceSchema.methods.incrementViews = async function() {
  this.interactions.views += 1;
  await this.save();
}

// Instance method to increment likes
resourceSchema.methods.incrementLikes = async function() {
  this.interactions.likes += 1;
  await this.save();
}

// Instance method to increment downloads
resourceSchema.methods.incrementDownloads = async function() {
  this.interactions.downloads += 1;
  await this.save();
}

// Static method to get resources by section
resourceSchema.statics.findBySection = function(sectionId, options = {}) {
  const { includeUnpublished = false, includeInactive = false } = options;
  
  const query = { sectionId, isDeleted: false };
  
  if (!includeUnpublished) {
    query.isPublished = true;
  }
  
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query)
    .populate('section', 'title courseId')
    .sort({ order: 1 });
}

// Static method to reorder resources
resourceSchema.statics.reorderResources = async function(sectionId, resourceOrders) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      for (const { resourceId, order } of resourceOrders) {
        await this.findByIdAndUpdate(
          resourceId,
          { order },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }
}

// Static method to get resources by type
resourceSchema.statics.findByType = function(type, options = {}) {
  const { limit = 50, page = 1 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({ 
    type, 
    isPublished: true, 
    isActive: true, 
    isDeleted: false 
  })
    .populate('section', 'title courseId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema)

export default Resource
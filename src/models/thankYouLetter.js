// models/thankYouLetter.js
import mongoose from 'mongoose'

// Simple schema for thank you letters
const thankYouLetterSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 100,
    default: 'Anonymous'
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  borderColor: {
    type: String,
    required: true,
    default: 'hsl(145, 80%, 44%)'
  },
  image: {
    type: String,
    trim: true
  },

  // Status
  isApproved: {
    type: Boolean,
    default: true
  },
  publish: {
    type: Boolean,
    default: false   // <--- NEW field
  }
}, {
  timestamps: true
})

// Index for better query performance
thankYouLetterSchema.index({ isApproved: 1, publish: 1, createdAt: -1 })

export const ThankYouLetter =
  mongoose.models.ThankYouLetter ||
  mongoose.model('ThankYouLetter', thankYouLetterSchema)

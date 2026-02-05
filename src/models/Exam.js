import mongoose from 'mongoose'

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    minlength: [3, 'Exam title must be at least 3 characters'],
    maxlength: [100, 'Exam title cannot exceed 100 characters']
  },
  year: {
    type: String,
    required: [true, 'Academic year is required'],
    enum: {
      values: ['firstAs', 'secondAs', 'thirdAs'],
      message: 'Invalid academic year'
    }
  },
  stream: {
    type: String,
    required: false, // Optional for 1as 'together' or strict checks
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  term: {
    type: Number,
    enum: [1, 2, 3],
    required: [true, 'Term (1, 2, or 3) is required']
  },
  type: {
    type: String,
    enum: ['exam', 'test'],
    default: 'exam'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasCorrection: {
    type: Boolean,
    default: false
  }
})

// Index for efficient querying
examSchema.index({ year: 1, subject: 1, type: 1 })
examSchema.index({ teacher: 1 })

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema)

export default Exam

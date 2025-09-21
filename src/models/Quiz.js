// src/models/Quiz.js
import mongoose from 'mongoose'

const QuizSchema = new mongoose.Schema({
  Question: {
    type: String,
    required: [true, 'Question is required']
  },
  order: {
    type: Number,
    required: true
  },
  ResourceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource ID is required'],
    validate: {
      validator: async function(v) {
        const Resource = mongoose.model('Resource');
        const rsc = await Resource.findById(v);
        return rsc && rsc.isActive && !rsc.isDeleted;
      },
      message: 'Invalid or inactive Resource'
    }
  },
  answers: {
    type: [String], 
    required: [true, 'answers are required']
  },
  answer: {
    type: String,
    required: [true, 'answer is required']
  }
})

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema)

export default Quiz
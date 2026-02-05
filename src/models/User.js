// src/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      // Remove unique: true from here
      trim: true,
      validate: {
        validator: function(v) {
          // Basic phone validation (adjust pattern as needed)
          return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid phone number'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function(password) {
          // Strong password validation
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
          return strongPasswordRegex.test(password);
        },
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      },
      select: false // Don't include password in queries by default
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Compound index: phoneNumber + isDeleted
// This allows the same phone number only when the previous account is deleted
userSchema.index(
  { phoneNumber: 1, isDeleted: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { isDeleted: false } // Only enforce uniqueness for non-deleted users
  }
)

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    this.passwordChangedAt = new Date()
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Update password method
userSchema.methods.updatePassword = async function(newPassword) {
  this.password = newPassword
  this.passwordChangedAt = new Date()
  return await this.save()
}

// Static method for password validation
userSchema.statics.validatePasswordStrength = function(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors.join(', ') : 'Password is strong',
    errors
  }
}

// Static method for password hashing
userSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12)
  return await bcrypt.hash(password, salt)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
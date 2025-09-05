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
      unique: true,
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
      default: true
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'teacher'],
      default: 'user'
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
)

// Compound index for better query performance
userSchema.index({ phoneNumber: 1, isActive: 1 });
userSchema.index({ email: 1 }, { sparse: true }); // For NextAuth compatibility

// Enhanced password hashing middleware
userSchema.pre('save', async function (next) {
  // Only hash if password is modified and exists
  if (!this.isModified('password') || !this.password) return next()
  
  try {
    // Generate salt with higher cost factor for better security
    const saltRounds = process.env.NODE_ENV === 'production' ? 15 : 12;
    const salt = await bcrypt.genSalt(saltRounds)
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt)
    
    // Update passwordChangedAt timestamp (except for new documents)
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for JWT compatibility
    }
    
    next()
  } catch (err) {
    next(err)
  }
})

// Enhanced password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.password) {
      throw new Error('User password not found');
    }
    
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error;
  }
}

// Static method to hash password manually (useful for NextAuth)
userSchema.statics.hashPassword = async function(password) {
  if (!password) throw new Error('Password is required');
  
  const saltRounds = process.env.NODE_ENV === 'production' ? 15 : 12;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

// Static method to verify password strength
userSchema.statics.validatePasswordStrength = function(password) {
  if (!password) return { isValid: false, message: 'Password is required' };
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!strongPasswordRegex.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' 
    };
  }
  
  return { isValid: true, message: 'Password is strong' };
}

// Method to safely update password
userSchema.methods.updatePassword = async function(newPassword) {
  const validation = this.constructor.validatePasswordStrength(newPassword);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
  
  this.password = newPassword;
  this.passwordChangedAt = Date.now();
  return await this.save();
}

// Pre-save middleware to normalize phone number
userSchema.pre('save', function(next) {
  if (this.isModified('phoneNumber') && this.phoneNumber) {
    // Remove spaces, hyphens, and parentheses from phone number
    this.phoneNumber = this.phoneNumber.replace(/[\s\-\(\)]/g, '');
  }
  next();
});

// Pre-save middleware to normalize email (for NextAuth compatibility)
userSchema.pre('save', function(next) {
  if (this.isModified('email') && this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema)
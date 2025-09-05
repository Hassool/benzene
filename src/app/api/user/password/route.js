// src/app/api/user/password/route.js

import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'

const handleError = (statusCode, message, error) => {
  console.error(message, error)
  return new Response(
    JSON.stringify({ 
      success: false,
      msg: message, 
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode, 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}

const handleSuccess = (statusCode, message, data = {}) => {
  return new Response(
    JSON.stringify({
      success: true,
      msg: message,
      data,
      timestamp: new Date().toISOString()
    }),
    { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// POST: Change password (requires authentication)
export async function POST(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    const { action, currentPassword, newPassword, phoneNumber } = await req.json()

    await connectDB()

    switch (action) {
      case 'change':
        return await handlePasswordChange(session.user.id, currentPassword, newPassword)
      case 'verify-strength':
        return await handlePasswordStrengthCheck(newPassword)
      case 'hash':
        return await handlePasswordHash(newPassword)
      default:
        return handleError(400, 'Invalid action. Use: change, verify-strength, or hash')
    }

  } catch (error) {
    return handleError(500, 'Password operation failed', error)
  }
}

// Handle password change
async function handlePasswordChange(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return handleError(400, 'Current password and new password are required')
  }

  if (currentPassword === newPassword) {
    return handleError(400, 'New password must be different from current password')
  }

  try {
    // Find user and include password field
    const user = await User.findById(userId).select('+password')
    
    if (!user) {
      return handleError(404, 'User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    
    if (!isCurrentPasswordValid) {
      return handleError(401, 'Current password is incorrect')
    }

    // Validate new password strength
    const validation = User.validatePasswordStrength(newPassword)
    if (!validation.isValid) {
      return handleError(400, validation.message)
    }

    // Update password using the model method (this will trigger hashing)
    await user.updatePassword(newPassword)

    return handleSuccess(200, 'Password changed successfully', {
      passwordChangedAt: user.passwordChangedAt
    })

  } catch (error) {
    return handleError(500, 'Failed to change password', error)
  }
}

// Handle password strength verification
async function handlePasswordStrengthCheck(password) {
  if (!password) {
    return handleError(400, 'Password is required')
  }

  try {
    const validation = User.validatePasswordStrength(password)
    
    return handleSuccess(200, 'Password strength checked', {
      isValid: validation.isValid,
      message: validation.message,
      requirements: {
        minLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password)
      }
    })

  } catch (error) {
    return handleError(500, 'Failed to check password strength', error)
  }
}

// Handle password hashing (utility function)
async function handlePasswordHash(password) {
  if (!password) {
    return handleError(400, 'Password is required')
  }

  try {
    // Validate password strength first
    const validation = User.validatePasswordStrength(password)
    if (!validation.isValid) {
      return handleError(400, validation.message)
    }

    const hashedPassword = await User.hashPassword(password)
    
    return handleSuccess(200, 'Password hashed successfully', {
      hash: hashedPassword,
      algorithm: 'bcrypt',
      rounds: process.env.NODE_ENV === 'production' ? 15 : 12
    })

  } catch (error) {
    return handleError(500, 'Failed to hash password', error)
  }
}

// GET: Get password requirements and user info (requires authentication)
export async function GET(req) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return handleError(401, 'Authentication required')
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select('passwordChangedAt fullName phoneNumber')
    
    if (!user) {
      return handleError(404, 'User not found')
    }

    return handleSuccess(200, 'Password information retrieved', {
      passwordRequirements: {
        minLength: 8,
        requiresLowercase: true,
        requiresUppercase: true,
        requiresNumber: true,
        requiresSpecialChar: true,
        allowedSpecialChars: '@$!%*?&'
      },
      passwordLastChanged: user.passwordChangedAt,
      user: {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber
      }
    })

  } catch (error) {
    return handleError(500, 'Failed to get password information', error)
  }
}
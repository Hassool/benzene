// src/app/api/user/route.js

import connectDB from '@/lib/mongoose' 
import User from '../../../models/User'
import { createCrudRoutes } from '@/lib/crudHandler'

const requiredFields = ['fullName', 'phoneNumber', 'password']

// Custom validation function for user-specific rules
const userValidation = async (data, operation) => {
  const errors = [];

  // Phone number validation
  if (data.phoneNumber) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const normalizedPhone = data.phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(normalizedPhone)) {
      errors.push('Invalid phone number format');
    }

    // Check for existing phone number (excluding deleted accounts)
    if (operation === 'create') {
      const existingUser = await User.findOne({
        phoneNumber: normalizedPhone,
        isDeleted: false
      });
      
      if (existingUser) {
        errors.push('This phone number is already registered with an active account');
      }
    }
  }

  // Full name validation
  if (data.fullName) {
    if (data.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters');
    }
    
    if (!/^[a-zA-Z\s\-\'\.]+$/.test(data.fullName)) {
      errors.push('Full name can only contain letters, spaces, hyphens, apostrophes, and periods');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Validation failed' : 'Valid',
    errors
  };
};

// Custom error handler for database errors
const handleDatabaseError = (error) => {
  console.error('Database error:', error);
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    
    if (field === 'phoneNumber') {
      return {
        success: false,
        error: 'This phone number is already registered',
        errors: ['This phone number is already registered with an active account'],
        statusCode: 409
      };
    }
    
    return {
      success: false,
      error: 'A record with these details already exists',
      errors: ['Duplicate data detected'],
      statusCode: 409
    };
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return {
      success: false,
      error: 'Validation failed',
      errors: validationErrors,
      statusCode: 400
    };
  }

  // Generic database error
  return {
    success: false,
    error: 'Database operation failed',
    errors: ['An unexpected database error occurred'],
    statusCode: 500
  };
};

// CRUD route options with enhanced security
const routeOptions = {
  excludeFromResponse: ['password', 'passwordResetToken', 'passwordResetExpires', 'loginAttempts', 'lockUntil'],
  allowPartialUpdate: true,
  enableSoftDelete: false, // Set to true if you want soft deletes
  customValidation: userValidation,
  passwordField: 'password',
  customErrorHandler: handleDatabaseError
};

const routes = createCrudRoutes(User, requiredFields, routeOptions);

export const POST = (req) => routes.POST(req, connectDB);
export const GET = (req) => routes.GET(req, connectDB);
export const DELETE = (req) => routes.DELETE(req, connectDB);
export const PATCH = (req) => routes.PATCH(req, connectDB);
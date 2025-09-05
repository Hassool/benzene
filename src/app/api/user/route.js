// src/app/api/user/route.js

import connectDB from '@/lib/mongoose' 
import User from '@/models/User'
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

  // Role validation (if provided)
  if (data.role && !['user', 'admin', 'moderator'].includes(data.role)) {
    errors.push('Invalid role. Must be user, admin, or moderator');
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Validation failed' : 'Valid',
    errors
  };
};

// CRUD route options with enhanced security
const routeOptions = {
  excludeFromResponse: ['password', 'passwordResetToken', 'passwordResetExpires', 'loginAttempts', 'lockUntil'],
  allowPartialUpdate: true,
  enableSoftDelete: false, // Set to true if you want soft deletes
  customValidation: userValidation,
  passwordField: 'password'
};

const routes = createCrudRoutes(User, requiredFields, routeOptions);

export const POST = (req) => routes.POST(req, connectDB);
export const GET = (req) => routes.GET(req, connectDB);
export const DELETE = (req) => routes.DELETE(req, connectDB);
export const PATCH = (req) => routes.PATCH(req, connectDB);
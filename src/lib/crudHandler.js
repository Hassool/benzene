// src/lib/crudHandler.js
import mongoose from 'mongoose'

export const createCrudRoutes = (Model, requiredFields = [], options = {}) => {
  const {
    excludeFromResponse = [],
    allowPartialUpdate = true,
    enableSoftDelete = false,
    customValidation = null,
    passwordField = 'password'
  } = options;

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

  const handleSuccess = (statusCode, message, data, meta = {}) => {
    return new Response(
      JSON.stringify({
        success: true,
        msg: message,
        data,
        ...meta,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const sanitizeData = (data) => {
    const sanitized = { ...data };
    excludeFromResponse.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  }

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // Strong password validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' 
      };
    }
    
    return { isValid: true };
  }

  return {
    POST: async (req, connectDB) => {
      try {
        await connectDB()
        const data = await req.json()

        // Validate required fields
        const missing = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '')
        if (missing.length > 0) {
          return handleError(400, 'Missing required fields', { missing })
        }

        // Custom validation if provided
        if (customValidation) {
          const validationResult = await customValidation(data, 'create');
          if (!validationResult.isValid) {
            return handleError(400, validationResult.message, validationResult.errors);
          }
        }

        // Special password validation for User model
        if (Model.modelName === 'User' && data[passwordField]) {
          const passwordValidation = validatePassword(data[passwordField]);
          if (!passwordValidation.isValid) {
            return handleError(400, passwordValidation.message);
          }
        }

        // Check for duplicate phone number (if it's a User model)
        if (Model.modelName === 'User' && data.phoneNumber) {
          const existingUser = await Model.findOne({ 
            phoneNumber: data.phoneNumber.replace(/[\s\-\(\)]/g, ''),
            isActive: true 
          });
          if (existingUser) {
            return handleError(409, 'Phone number already exists');
          }
        }

        // Create new document
        const doc = new Model(data)
        await doc.save()
        
        // Remove sensitive fields from response
        const responseData = sanitizeData(doc.toJSON());
        
        return handleSuccess(201, `${Model.modelName} created successfully`, responseData)
      } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          return handleError(409, `${field} already exists`);
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return handleError(400, 'Validation failed', { errors: validationErrors });
        }
        
        return handleError(500, `Error creating ${Model.modelName}`, error)
      }
    },

    GET: async (req, connectDB) => {
      try {
        await connectDB()
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        const page = parseInt(url.searchParams.get('page')) || 1
        const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100) // Max 100 per page
        const search = url.searchParams.get('search')
        const sortBy = url.searchParams.get('sortBy') || 'createdAt'
        const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1
        
        if (id) {
          // Get single document
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleError(400, 'Invalid ID format')
          }
          
          let query = Model.findById(id);
          
          // Exclude soft deleted items
          if (enableSoftDelete) {
            query = query.where({ isDeleted: { $ne: true } });
          }
          
          const doc = await query.exec();
          
          if (!doc) {
            return handleError(404, `${Model.modelName} not found`)
          }
          
          const responseData = sanitizeData(doc.toJSON());
          return handleSuccess(200, `${Model.modelName} retrieved successfully`, responseData)
        } else {
          // Get multiple documents with pagination
          let query = {};
          
          // Add search functionality
          if (search && Model.modelName === 'User') {
            query.$or = [
              { fullName: { $regex: search, $options: 'i' } },
              { phoneNumber: { $regex: search, $options: 'i' } }
            ];
          }
          
          // Exclude soft deleted items
          if (enableSoftDelete) {
            query.isDeleted = { $ne: true };
          }
          
          // For User model, only show active users by default
          if (Model.modelName === 'User') {
            query.isActive = { $ne: false };
          }
          
          const skip = (page - 1) * limit;
          const sort = { [sortBy]: sortOrder };
          
          const [docs, total] = await Promise.all([
            Model.find(query)
              .sort(sort)
              .skip(skip)
              .limit(limit)
              .exec(),
            Model.countDocuments(query)
          ]);
          
          const responseData = docs.map(doc => sanitizeData(doc.toJSON()));
          
          const meta = {
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
              hasNext: page < Math.ceil(total / limit),
              hasPrev: page > 1
            }
          };
          
          return handleSuccess(200, `${Model.modelName}s retrieved successfully`, responseData, meta)
        }
      } catch (error) {
        return handleError(500, `Error retrieving ${Model.modelName}`, error)
      }
    },

    DELETE: async (req, connectDB) => {
      try {
        await connectDB()
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return handleError(400, 'Invalid ID format')
        }
        
        let deletedDoc;
        
        if (enableSoftDelete) {
          // Soft delete
          deletedDoc = await Model.findByIdAndUpdate(
            id,
            { 
              isDeleted: true, 
              deletedAt: new Date(),
              isActive: false 
            },
            { new: true }
          );
        } else {
          // Hard delete
          deletedDoc = await Model.findByIdAndDelete(id);
        }
        
        if (!deletedDoc) {
          return handleError(404, `${Model.modelName} not found`)
        }
        
        const responseData = sanitizeData(deletedDoc.toJSON());
        return handleSuccess(200, `${Model.modelName} deleted successfully`, responseData)
      } catch (error) {
        return handleError(500, `Error deleting ${Model.modelName}`, error)
      }
    },

    PATCH: async (req, connectDB) => {
      try {
        await connectDB()
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        const updateData = await req.json()
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return handleError(400, 'Invalid ID format')
        }
        
        if (Object.keys(updateData).length === 0) {
          return handleError(400, 'No update data provided')
        }
        
        // Remove sensitive fields that shouldn't be updated directly
        const restrictedFields = ['_id', '__v', 'createdAt', 'passwordResetToken', 'passwordResetExpires'];
        restrictedFields.forEach(field => delete updateData[field]);
        
        // Special handling for password updates
        if (updateData[passwordField]) {
          const passwordValidation = validatePassword(updateData[passwordField]);
          if (!passwordValidation.isValid) {
            return handleError(400, passwordValidation.message);
          }
        }
        
        // Check for duplicate phone number (if updating phone number)
        if (Model.modelName === 'User' && updateData.phoneNumber) {
          const normalizedPhone = updateData.phoneNumber.replace(/[\s\-\(\)]/g, '');
          const existingUser = await Model.findOne({ 
            phoneNumber: normalizedPhone,
            _id: { $ne: id },
            isActive: true 
          });
          if (existingUser) {
            return handleError(409, 'Phone number already exists');
          }
        }
        
        // Custom validation if provided
        if (customValidation) {
          const validationResult = await customValidation(updateData, 'update');
          if (!validationResult.isValid) {
            return handleError(400, validationResult.message, validationResult.errors);
          }
        }
        
        const updatedDoc = await Model.findByIdAndUpdate(
          id, 
          updateData, 
          { 
            new: true, 
            runValidators: true,
            context: 'query'
          }
        );
        
        if (!updatedDoc) {
          return handleError(404, `${Model.modelName} not found`)
        }
        
        const responseData = sanitizeData(updatedDoc.toJSON());
        return handleSuccess(200, `${Model.modelName} updated successfully`, responseData)
      } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          return handleError(409, `${field} already exists`);
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          return handleError(400, 'Validation failed', { errors: validationErrors });
        }
        
        return handleError(500, `Error updating ${Model.modelName}`, error)
      }
    }
  }
}
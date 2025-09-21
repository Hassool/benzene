// app/api/quiz/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route' // ✅ Import authOptions
import { createCrudRoutes } from '@/lib/crudHandler';
import connectDB from '@/lib/mongoose';
import Quiz from '@/models/Quiz';
import Resource from '@/models/Resource';

// Custom validation function for Quiz
const quizValidation = async (data, operation) => {
  try {
    const { Question, order, ResourceID, answers, answer } = data;

    if (operation === 'create') {
      if (!Question || !order || !ResourceID || !answers || !answer) {
        return {
          isValid: false,
          message: 'Missing required fields: Question, order, ResourceID, answers, and answer are required'
        };
      }
    }

    // Validate ResourceID if provided
    if (ResourceID) {
      const resource = await Resource.findById(ResourceID);
      if (!resource) {
        return {
          isValid: false,
          message: 'The specified resource does not exist'
        };
      }

      if (resource.type !== 'quiz') {
        return {
          isValid: false,
          message: 'Resource must be of type "quiz"'
        };
      }
    }

    // Validate that answer is one of the provided answers
    if (answers && answer && !answers.includes(answer)) {
      return {
        isValid: false,
        message: 'The correct answer must be one of the provided answer options'
      };
    }

    // Check for duplicate order within the same resource
    if (order && ResourceID) {
      const query = { ResourceID, order };
      if (operation === 'update' && data._id) {
        query._id = { $ne: data._id };
      }
      const existingQuiz = await Quiz.findOne(query);
      if (existingQuiz) {
        return {
          isValid: false,
          message: 'A quiz with this order already exists for this resource'
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: error.message || 'Validation error occurred'
    };
  }
};

// Create CRUD routes
const crudRoutes = createCrudRoutes(
  Quiz,
  ['Question', 'order', 'ResourceID', 'answers', 'answer'],
  {
    customValidation: quizValidation,
    enableSoftDelete: false,
    excludeFromResponse: []
  }
);

// GET handler - public access for reading quizzes
export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const resourceId = url.searchParams.get('resourceId');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

    if (id) {
      const quiz = await Quiz.findById(id).populate('ResourceID', 'title type sectionId');
      if (!quiz) {
        return new Response(JSON.stringify({
          success: false,
          msg: 'Quiz not found',
          timestamp: new Date().toISOString()
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        success: true,
        msg: 'Quiz retrieved successfully',
        data: quiz,
        timestamp: new Date().toISOString()
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const query = resourceId ? { ResourceID: resourceId } : {};
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('ResourceID', 'title type')
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),
      Quiz.countDocuments(query)
    ]);

    return new Response(JSON.stringify({
      success: true,
      msg: 'Quizzes retrieved successfully',
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('GET /api/quiz error:', error);
    return new Response(JSON.stringify({
      success: false,
      msg: 'Error retrieving quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// POST handler with authentication
export async function POST(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    console.log('Quiz POST - Session check:', { 
      hasSession: !!session,
      userId: session?.user?.id,
      phoneNumber: session?.user?.phoneNumber 
    });
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const data = await req.json();
    console.log('Creating quiz with data:', { 
      Question: data.Question, 
      ResourceID: data.ResourceID,
      order: data.order 
    });

    // Verify user owns the resource through the resource's section and course
    const resource = await Resource.findById(data.ResourceID)
      .populate({
        path: 'sectionId',
        populate: {
          path: 'courseId'
        }
      });

    if (!resource) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Resource not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user owns the course
    if (resource.sectionId?.courseId?.userID && resource.sectionId.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to create quizzes for this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add created by info
    data.createdBy = session.user.id;
    data.createdAt = new Date();

    // Create quiz
    const quiz = new Quiz(data);
    await quiz.save();
    
    // Populate the response
    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('ResourceID', 'title type');
    
    console.log('Quiz created successfully:', quiz._id);

    return new Response(JSON.stringify({
      success: true,
      msg: 'Quiz created successfully',
      data: populatedQuiz,
      timestamp: new Date().toISOString()
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('POST /api/quiz error:', error);
    return new Response(JSON.stringify({
      success: false,
      msg: 'Error creating quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// PATCH handler with authentication
export async function PATCH(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const updateData = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Quiz ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if quiz exists and user owns it
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'ResourceID',
        populate: {
          path: 'sectionId',
          populate: {
            path: 'courseId'
          }
        }
      });

    if (!quiz) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (quiz.ResourceID?.sectionId?.courseId?.userID && quiz.ResourceID.sectionId.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to update this quiz' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add update metadata
    updateData.updatedBy = session.user.id;
    updateData.updatedAt = new Date();

    // Validate if we're updating the ResourceID
    if (updateData.ResourceID && updateData.ResourceID !== quiz.ResourceID._id.toString()) {
      const newResource = await Resource.findById(updateData.ResourceID);
      if (!newResource || newResource.type !== 'quiz') {
        return new Response(
          JSON.stringify({ success: false, msg: 'Invalid resource or resource type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ResourceID', 'title type');

    return new Response(JSON.stringify({
      success: true,
      msg: 'Quiz updated successfully',
      data: updatedQuiz,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('PATCH /api/quiz error:', error);
    return new Response(JSON.stringify({
      success: false,
      msg: 'Error updating quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// DELETE handler with authentication
export async function DELETE(req) {
  try {
    // ✅ Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Quiz ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if quiz exists and user owns it
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'ResourceID',
        populate: {
          path: 'sectionId',
          populate: {
            path: 'courseId'
          }
        }
      });

    if (!quiz) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    if (quiz.ResourceID?.sectionId?.courseId?.userID && quiz.ResourceID.sectionId.courseId.userID.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ success: false, msg: 'Not authorized to delete this quiz' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete quiz (hard delete since enableSoftDelete: false)
    await Quiz.findByIdAndDelete(id);

    return new Response(JSON.stringify({
      success: true,
      msg: 'Quiz deleted successfully',
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('DELETE /api/quiz error:', error);
    return new Response(JSON.stringify({
      success: false,
      msg: 'Error deleting quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
// app/api/quiz/reorder/route.js
import connectDB from '@/lib/mongoose';
import Quiz from '@/models/Quiz';

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { resourceId, quizzes } = body;

    if (!resourceId || !Array.isArray(quizzes)) {
      return new Response(JSON.stringify({
        success: false,
        msg: 'Resource ID and quizzes array are required',
        timestamp: new Date().toISOString()
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify all quizzes belong to the specified resource
    const existingQuizzes = await Quiz.find({ ResourceID: resourceId });
    const existingIds = existingQuizzes.map(q => q._id.toString());

    for (const quiz of quizzes) {
      if (!existingIds.includes(quiz.id.toString())) {
        return new Response(JSON.stringify({
          success: false,
          msg: `Quiz ${quiz.id} does not belong to resource ${resourceId}`,
          timestamp: new Date().toISOString()
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Update orders
    await Promise.all(
      quizzes.map((quiz, index) =>
        Quiz.findByIdAndUpdate(quiz.id, { order: index + 1 })
      )
    );

    // Fetch updated quizzes
    const updatedQuizzes = await Quiz.find({ ResourceID: resourceId })
      .populate('ResourceID', 'title type')
      .sort({ order: 1 });

    return new Response(JSON.stringify({
      success: true,
      msg: 'Quiz order updated successfully',
      data: updatedQuizzes,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('PUT /api/quiz/reorder error:', error);
    return new Response(JSON.stringify({
      success: false,
      msg: 'Failed to reorder quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

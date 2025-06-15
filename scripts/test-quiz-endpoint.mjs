import fetch from 'node-fetch';

async function testQuizEndpoint() {
  try {
    // Replace with a valid quiz ID from your database
    const quizId = 'OEH4HG'; // This was mentioned in your conversation as having 3 questions

    console.log(`🧪 Testing quiz endpoint with quiz ID: ${quizId}`);

    const response = await fetch(`http://localhost:3000/api/quiz/${quizId}`);
    const data = await response.json();

    console.log('🔍 API Response Status:', response.status);
    console.log('📊 Quiz Data Summary:', {
      hasData: !!data,
      hasError: !!data.error,
      hasQuestions: data && Array.isArray(data.questions),
      questionCount: data?.questions?.length || 0,
    });

    if (data.error) {
      console.log('❌ Error from API:', data.error);
    }

    if (data.questions && data.questions.length > 0) {
      console.log('✅ Questions are now accessible!');
      console.log(
        `📋 Found ${data.questions.length} questions for quiz ${quizId}`
      );

      // Show question titles
      console.log('Questions:');
      data.questions.forEach((q, index) => {
        console.log(
          `  ${index + 1}. ${q.text || 'No title'} (${q.answers?.length || 0} answers)`
        );
      });
    } else {
      console.log('❌ No questions found. RLS fixes may not be applied yet.');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testQuizEndpoint();

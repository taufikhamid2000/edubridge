import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Question {
  text: string;
  type: 'radio' | 'checkbox';
  options: string[];
}

export default function CreateQuiz() {
  const router = useRouter();
  const { subject, topic } = router.query;
  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'radio', options: [] }]);
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (field === 'text' || field === 'type') {
      if (field === 'type' && (value === 'radio' || value === 'checkbox')) {
        updatedQuestions[index][field] = value;
      } else if (field === 'text') {
        updatedQuestions[index][field] = value;
      }
    }
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCreateQuiz = async () => {
    if (!quizName) {
      alert('Please enter a quiz name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('quizzes').insert({
        name: quizName,
        topic_id: topic,
        created_by: 'user-id-placeholder', // Replace with actual user ID from auth
      });

      if (error) {
        throw error;
      }

      alert('Quiz created successfully!');
      router.push(`/quiz/${subject}/${topic}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the quiz.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Create a New Quiz</h1>
          <div className="formField">
            <label htmlFor="quizName">Quiz Name</label>
            <input
              type="text"
              id="quizName"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
          </div>
          {questions.map((question, index) => (
            <div key={index} className="formField">
              <label htmlFor={`question-${index}`}>Question {index + 1}</label>
              <input
                type="text"
                id={`question-${index}`}
                placeholder="Enter question text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(index, 'text', e.target.value)
                }
              />
              <label htmlFor={`type-${index}`}>Answer Type</label>
              <select
                id={`type-${index}`}
                value={question.type}
                onChange={(e) =>
                  handleQuestionChange(index, 'type', e.target.value)
                }
              >
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
              </select>
              {question.type === 'radio' && (
                <div className="formField">
                  <label>Options</label>
                  {question.options?.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      type="text"
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, optionIndex, e.target.value)
                      }
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(index)}
                    className="create-quiz-btn"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
          <button onClick={handleAddQuestion} className="create-quiz-btn">
            Add Question
          </button>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleCreateQuiz}
            disabled={loading}
            className="create-quiz-btn disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

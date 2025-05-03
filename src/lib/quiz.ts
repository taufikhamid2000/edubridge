export async function getQuizQuestions(subject: string, topic: string) {
  // Placeholder function to simulate fetching quiz questions
  console.log(`Fetching questions for subject: ${subject}, topic: ${topic}`);
  return [
    {
      id: 1,
      question: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      answer: '4',
    },
    {
      id: 2,
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin'],
      answer: 'Paris',
    },
  ];
}

import React from 'react';

export default function Quiz({
  questions,
}: {
  questions: {
    id: number;
    question: string;
    options: string[];
    answer: string;
  }[];
}) {
  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          <ul>
            {q.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function QuizForm({ register, handleSubmit, errors, onSubmit }: any) {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="quizName">Quiz Name</label>
        <input id="quizName" {...register('name', { required: true })} />
        {errors.name && <span>This field is required</span>}
      </div>
      <button type="submit">Create Quiz</button>
    </form>
  );
}

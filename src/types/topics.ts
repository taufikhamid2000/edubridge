export interface Topic {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number | null;
  time_estimate_minutes: number | null;
  order_index: number;
  chapters: Chapter;
}

export interface Chapter {
  id: string;
  form: number;
  title: string;
  order_index: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  category_priority?: number;
  order_index?: number;
}

export interface Quiz {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  verified: boolean;
  topic_id: string;
  email?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: 'radio' | 'checkbox';
  order_index: number;
  created_at: string;
  updated_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

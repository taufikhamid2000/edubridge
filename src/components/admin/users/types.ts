export interface Achievement {
  id: string;
  name: string;
  title: string;
  description?: string;
  icon_url?: string;
  user_id: string;
  earned_at: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  max_score: number;
  correct_answers: number;
  total_questions: number;
  completed: boolean;
  time_spent?: number;
  created_at: string;
  updated_at: string;
  quiz_title?: string;
  subject?: string;
  topic?: string;
}

export interface UserDetail {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  streak: number;
  daily_xp: number;
  weekly_xp: number;
  created_at: string;
  role: string;
  last_login: string;
  status?: 'active' | 'suspended'; // Legacy status field - use is_disabled instead
  is_disabled?: boolean;
  achievements: Achievement[];
  quiz_history: QuizAttempt[];
}

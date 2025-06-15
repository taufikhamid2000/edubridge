import { SchoolRole } from './schools';

// User types for leaderboard and profile features
export interface School {
  id: string;
  name: string;
  type: string;
  district: string;
  state: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  streak: number;
  xp: number;
  level: number;
  lastQuizDate?: string;
  created_at?: string;
  school_id?: string;
  school_role?: SchoolRole;
  is_school_visible?: boolean;
  school?: School;
}

// User achievements
export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  progress?: number;
  max_progress?: number;
}

// Leaderboard filters
export interface LeaderboardFilters {
  timeFrame: 'daily' | 'weekly' | 'allTime';
  subject_id?: string | null;
}

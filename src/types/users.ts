// User types for leaderboard and profile features
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

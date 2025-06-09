export type SchoolType =
  | 'SMK'
  | 'SMKA'
  | 'MRSM'
  | 'Sekolah Sains'
  | 'Sekolah Sukan'
  | 'Sekolah Seni'
  | 'SBP'
  | 'SMJK'
  | 'KV';

export type SchoolRole = 'student' | 'teacher' | 'admin';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  code?: string;
  district: string;
  state: string;
  address?: string;
  website?: string;
  phone?: string;
  principal_name?: string;
  total_students?: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolStats {
  school_id: string;
  average_score: number;
  participation_rate: number;
  total_quizzes_taken: number;
  total_questions_answered: number;
  correct_answers: number;
  last_calculated_at: string;
}

export interface SchoolWithStats extends School {
  stats: SchoolStats;
}

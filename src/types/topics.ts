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

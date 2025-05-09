export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          icon?: string;
          created_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          subject_id: string;
          form: number;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          form: number;
          title: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          form?: number;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          chapter_id: string;
          title: string;
          description: string | null;
          difficulty_level: number | null;
          time_estimate_minutes: number | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          title: string;
          description?: string | null;
          difficulty_level?: number | null;
          time_estimate_minutes?: number | null;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          title?: string;
          description?: string | null;
          difficulty_level?: number | null;
          time_estimate_minutes?: number | null;
          order_index?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

import { PublicSubject } from '@/services/subjectService';

// Enhanced PublicSubject with topics for career guidance
export interface EnhancedSubject extends PublicSubject {
  topics?: string[];
}

export interface CareerPathway {
  id: string;
  title: string;
  description: string;
  mustLearnIds: string[]; // Subject IDs
  shouldLearnIds: string[]; // Subject IDs
  canLearnIds: string[]; // Subject IDs
}

// Represents a user-submitted career pathway suggestion
export interface CareerContribution {
  title: string;
  description: string;
  mustLearnSubjects: string[]; // Subject names
  shouldLearnSubjects: string[]; // Subject names
  canLearnSubjects: string[]; // Subject names
  submitterName: string;
  submitterEmail: string;
  additionalNotes?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

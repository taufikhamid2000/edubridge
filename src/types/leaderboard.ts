export interface School {
  id: string;
  name: string;
  type: SchoolType;
  district: string;
  state: string;
  totalStudents: number;
  averageScore: number;
  participationRate: number;
  rank: number;
}

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

export interface SchoolStats {
  totalSchools: number;
  totalStudents: number;
  averageParticipation: number;
  growthRate: {
    schools: number;
    participation: number;
    students: number;
  };
}

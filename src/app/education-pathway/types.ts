// Types for the Education Pathway feature

export interface EducationPathway {
  id: string;
  career: string;
  description: string;
  careerOutlook: {
    demand: 'high' | 'medium' | 'low';
    salaryRange: {
      min: number;
      max: number;
    };
    growthOutlook: string;
  };
  pathways: EducationStep[];
}

export interface EducationStep {
  level: 'pre-university' | 'bachelor' | 'master' | 'phd' | 'professional-cert';
  title: string;
  description: string;
  duration: string; // e.g., "1-1.5 years", "3-4 years"
  options: EducationOption[];
}

export interface EducationOption {
  name: string;
  institutions?: string[];
  description: string;
  advantages: string[];
  challenges: string[];
  requirements?: string[];
  link?: string;
}

export interface PathwayContribution {
  career: string;
  description: string;
  preUniversityOptions: string[];
  bachelorOptions: string[];
  advancedOptions?: string[];
  certifications?: string[];
  additionalNotes?: string;
  submitterName: string;
  submitterEmail: string;
}

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

export interface CareerOutlook {
  demand: 'high' | 'medium' | 'low';
  salaryRange: {
    min: number;
    max: number;
  };
  growthOutlook: string;
}

export interface PathwayOptions {
  preUniversity: PathwayOptionDetail[];
  bachelor: PathwayOptionDetail[];
  advanced?: PathwayOptionDetail[];
  certifications?: PathwayOptionDetail[];
}

export interface PathwayContribution {
  career: string;
  description: string;
  careerOutlook: CareerOutlook;
  pathwayOptions: PathwayOptions;
  additionalNotes?: string;
  submitterName: string;
  submitterEmail: string;
}

export interface PathwayOptionDetail {
  name: string;
  description: string;
  institutions?: string[];
  advantages: string[];
  challenges: string[];
  requirements?: string[];
  duration?: string;
}

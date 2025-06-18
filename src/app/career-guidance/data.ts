import { CareerPathway } from './types';

// Career pathways data with subject mapping
export const careerPathways: CareerPathway[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description:
      'Design, develop, and maintain software systems and applications',
    mustLearnIds: [
      'computer-science',
      'programming-fundamentals',
      'mathematics',
    ],
    shouldLearnIds: ['databases', 'web-development', 'software-engineering'],
    canLearnIds: ['cloud-computing', 'mobile-development', 'machine-learning'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description:
      'Extract insights and knowledge from structured and unstructured data',
    mustLearnIds: ['statistics', 'mathematics', 'programming-fundamentals'],
    shouldLearnIds: ['machine-learning', 'databases', 'data-visualization'],
    canLearnIds: ['deep-learning', 'big-data', 'natural-language-processing'],
  },
  {
    id: 'medical-doctor',
    title: 'Medical Doctor',
    description:
      'Diagnose and treat illnesses, injuries, and other health conditions',
    mustLearnIds: ['biology', 'chemistry', 'physiology'],
    shouldLearnIds: ['anatomy', 'psychology', 'biochemistry'],
    canLearnIds: ['genetics', 'pharmacology', 'medical-research'],
  },
  {
    id: 'educator',
    title: 'Educator',
    description:
      'Teach students and develop curriculum for educational institutions',
    mustLearnIds: [
      'education-principles',
      'child-development',
      'communication',
    ],
    shouldLearnIds: [
      'psychology',
      'curriculum-development',
      'educational-technology',
    ],
    canLearnIds: [
      'special-education',
      'educational-leadership',
      'educational-research',
    ],
  },
];

// Define a mapping of subject IDs to actual subjects in the database
// This will be replaced with real data from your database
export const subjectMapping: Record<
  string,
  { name: string; description: string; topics: string[] }
> = {
  'computer-science': {
    name: 'Computer Science',
    description:
      'Core principles of computing including algorithms and data structures',
    topics: ['Algorithms', 'Data Structures', 'Computational Theory'],
  },
  'programming-fundamentals': {
    name: 'Programming Fundamentals',
    description: 'Fundamentals of programming languages and paradigms',
    topics: ['Java', 'Python', 'JavaScript', 'Object-Oriented Programming'],
  },
  mathematics: {
    name: 'Mathematics',
    description: 'Mathematical foundations for various fields',
    topics: ['Algebra', 'Calculus', 'Discrete Mathematics', 'Statistics'],
  },
  databases: {
    name: 'Databases',
    description:
      'Working with structured and unstructured data storage systems',
    topics: ['SQL', 'Database Design', 'NoSQL'],
  },
  'web-development': {
    name: 'Web Development',
    description: 'Building applications for the web',
    topics: ['HTML/CSS', 'JavaScript', 'Web Frameworks'],
  },
  'software-engineering': {
    name: 'Software Engineering',
    description: 'Professional development practices and methodologies',
    topics: ['Testing', 'Version Control', 'Agile Development'],
  },
  'cloud-computing': {
    name: 'Cloud Computing',
    description: 'Leveraging cloud infrastructure for applications',
    topics: ['AWS', 'Azure', 'GCP', 'Serverless'],
  },
  'mobile-development': {
    name: 'Mobile Development',
    description: 'Building applications for mobile platforms',
    topics: ['Android', 'iOS', 'React Native', 'Flutter'],
  },
  'machine-learning': {
    name: 'Machine Learning',
    description: 'Building systems that learn from data',
    topics: [
      'Supervised Learning',
      'Unsupervised Learning',
      'Reinforcement Learning',
    ],
  },
  statistics: {
    name: 'Statistics',
    description: 'Statistical methods and analysis',
    topics: ['Probability', 'Inferential Statistics', 'Hypothesis Testing'],
  },
  'data-visualization': {
    name: 'Data Visualization',
    description: 'Effectively presenting data through visual means',
    topics: ['Charts', 'Dashboards', 'Visualization Tools'],
  },
  'deep-learning': {
    name: 'Deep Learning',
    description: 'Neural network architectures and applications',
    topics: ['Neural Networks', 'Computer Vision', 'NLP'],
  },
  'big-data': {
    name: 'Big Data',
    description: 'Processing and analyzing large-scale datasets',
    topics: ['Hadoop', 'Spark', 'Data Warehousing'],
  },
  'natural-language-processing': {
    name: 'Natural Language Processing',
    description: 'Computational processing of human language',
    topics: [
      'Text Classification',
      'Sentiment Analysis',
      'Machine Translation',
    ],
  },
  biology: {
    name: 'Biology',
    description: 'Study of living organisms and their interactions',
    topics: ['Cell Biology', 'Genetics', 'Ecology'],
  },
  chemistry: {
    name: 'Chemistry',
    description: 'Study of matter, its properties, and transformations',
    topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Biochemistry'],
  },
  physiology: {
    name: 'Physiology',
    description: 'Study of how living systems function',
    topics: ['Human Physiology', 'Cellular Functions', 'Organ Systems'],
  },
  anatomy: {
    name: 'Anatomy',
    description: 'Study of the structure of organisms and their parts',
    topics: ['Human Anatomy', 'Comparative Anatomy', 'Microscopic Anatomy'],
  },
  psychology: {
    name: 'Psychology',
    description: 'Study of mind and behavior',
    topics: [
      'Clinical Psychology',
      'Cognitive Psychology',
      'Behavioral Psychology',
    ],
  },
  biochemistry: {
    name: 'Biochemistry',
    description: 'Study of chemical processes in living organisms',
    topics: ['Enzymes', 'Metabolism', 'Molecular Biology'],
  },
  genetics: {
    name: 'Genetics',
    description: 'Study of genes, heredity, and genetic variation',
    topics: ['Molecular Genetics', 'Population Genetics', 'Genomics'],
  },
  pharmacology: {
    name: 'Pharmacology',
    description: 'Study of drug action and effects on living systems',
    topics: ['Drug Mechanisms', 'Pharmacokinetics', 'Clinical Pharmacology'],
  },
  'medical-research': {
    name: 'Medical Research',
    description: 'Scientific investigation in medicine and healthcare',
    topics: ['Clinical Trials', 'Translational Research', 'Epidemiology'],
  },
  'education-principles': {
    name: 'Education Principles',
    description: 'Fundamental theories and practices in education',
    topics: ['Learning Theories', 'Instructional Design', 'Assessment'],
  },
  'child-development': {
    name: 'Child Development',
    description: 'Study of physical, cognitive, and social growth of children',
    topics: [
      'Developmental Stages',
      'Cognitive Development',
      'Social Development',
    ],
  },
  communication: {
    name: 'Communication',
    description: 'Effective exchange of information and ideas',
    topics: [
      'Public Speaking',
      'Written Communication',
      'Nonverbal Communication',
    ],
  },
  'curriculum-development': {
    name: 'Curriculum Development',
    description: 'Creating and implementing educational programs',
    topics: [
      'Curriculum Design',
      'Learning Objectives',
      'Educational Standards',
    ],
  },
  'educational-technology': {
    name: 'Educational Technology',
    description: 'Technology tools and resources for education',
    topics: ['E-Learning', 'Educational Software', 'Digital Assessment'],
  },
  'special-education': {
    name: 'Special Education',
    description: 'Educating students with special needs or disabilities',
    topics: [
      'Inclusive Education',
      'Individualized Education Programs',
      'Assistive Technology',
    ],
  },
  'educational-leadership': {
    name: 'Educational Leadership',
    description: 'Administration and management in educational settings',
    topics: [
      'School Administration',
      'Educational Policy',
      'Organizational Leadership',
    ],
  },
  'educational-research': {
    name: 'Educational Research',
    description: 'Scientific investigation in education',
    topics: ['Research Methods', 'Data Analysis', 'Action Research'],
  },
};

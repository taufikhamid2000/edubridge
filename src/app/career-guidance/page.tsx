'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { fetchPublicSubjects, PublicSubject } from '@/services/subjectService';

// Enhanced PublicSubject with topics for career guidance
interface EnhancedSubject extends PublicSubject {
  topics?: string[];
}

interface CareerPathway {
  id: string;
  title: string;
  description: string;
  mustLearnIds: string[]; // Subject IDs
  shouldLearnIds: string[]; // Subject IDs
  canLearnIds: string[]; // Subject IDs
}

// Career pathways data with subject mapping
const careerPathways: CareerPathway[] = [
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
const subjectMapping: Record<
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

export default function CareerGuidancePage() {
  const router = useRouter();
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all subjects from the API
  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data, error } = await fetchPublicSubjects();
        if (error || !data) {
          console.error('Error loading subjects:', error);
          return;
        }
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();
  }, []);

  // Filter careers based on search term
  const filteredCareers = useMemo(() => {
    if (!searchTerm) return careerPathways;

    return careerPathways.filter((career) =>
      career.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  // Get selected career details
  const selectedCareer = useMemo(() => {
    return careerPathways.find((career) => career.id === selectedCareerId);
  }, [selectedCareerId]); // Memoize the subject lookup function to make it stable across renders
  const getSubjectsByIds = useMemo(() => {
    // Return a function that maps IDs to enhanced subjects with topics
    return (subjectIds: string[]): EnhancedSubject[] => {
      // First try to match with actual subjects from the database
      return subjectIds.map((id) => {
        // Try different matching strategies in order of relevance
        // 1. Direct slug match
        // 2. ID contains slug or slug contains ID
        // 3. Name similarity with lowercasing and normalization
        // 4. Category match if available

        // Normalize strings for comparison - remove special chars, lowercase
        const normalizeString = (str: string) =>
          str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedId = normalizeString(id);

        // Find the best match among all subjects
        const matchedSubject = subjects.find((s) => {
          // Direct slug match
          if (s.slug === id) return true;

          // Partial slug match
          if (s.slug && (s.slug.includes(id) || id.includes(s.slug)))
            return true;

          // Normalized name match
          if (
            normalizeString(s.name).includes(normalizedId) ||
            normalizedId.includes(normalizeString(s.name))
          )
            return true;

          // Category match if available
          if (s.category && normalizeString(s.category).includes(normalizedId))
            return true;

          return false;
        });

        if (matchedSubject) {
          return {
            id: matchedSubject.id,
            name: matchedSubject.name,
            description: matchedSubject.description || '',
            slug: matchedSubject.slug || '',
            icon: matchedSubject.icon,
            category: matchedSubject.category,
            // Use topics from our mapping as they don't exist in the database
            topics: subjectMapping[id]?.topics || [],
          };
        }

        // If no match, use our fallback mapping
        return {
          id,
          name: subjectMapping[id]?.name || id,
          description: subjectMapping[id]?.description || '',
          slug: id,
          topics: subjectMapping[id]?.topics || [],
        };
      });
    };
  }, [subjects]); // This computed variable isn't needed since we're using getSubjectsByIds directly in the JSX
  // The LoadingState component is now used at the subject level rather than for the whole page
  // This allows the UI to render and be interactive while subject data is loading

  return (
    <>
      <Head>
        <title>Career Guidance - EduBridge</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Career Guidance
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-300">
              Discover the subjects you need to learn to achieve your dream
              career
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto">
            <label
              htmlFor="career-search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              What do you want to be?
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="career-search"
                id="career-search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 py-3 sm:text-lg border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Search for a career..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <ul className="mt-2 bg-white dark:bg-gray-800 shadow-md rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCareers.map((career) => (
                  <li
                    key={career.id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedCareerId(career.id);
                      setSearchTerm('');
                    }}
                  >
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {career.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {career.description}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>{' '}
          {selectedCareer && (
            <div id="career-details" className="mt-12 pt-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedCareer.title}
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
                  {selectedCareer.description}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {' '}
                {/* Must Learn Section */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-red-500 dark:bg-red-600">
                    <h3 className="text-lg font-bold text-white">Must Learn</h3>
                    <p className="text-red-100 text-sm">
                      Essential subjects for this career
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-red-200 dark:divide-red-800">
                        {selectedCareer.mustLearnIds.map((subjectId) => {
                          const subjects = getSubjectsByIds([subjectId]);
                          const subject = subjects[0];
                          return subject ? (
                            <li key={subjectId} className="py-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {subject.name}
                              </h4>
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {subject.description}
                              </p>
                              {subject.topics && subject.topics.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {subject.topics.map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    )}
                  </div>
                </div>{' '}
                {/* Should Learn Section */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-amber-500 dark:bg-amber-600">
                    <h3 className="text-lg font-bold text-white">
                      Should Learn
                    </h3>
                    <p className="text-amber-100 text-sm">
                      Recommended subjects for proficiency
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-amber-200 dark:divide-amber-800">
                        {selectedCareer.shouldLearnIds.map((subjectId) => {
                          const subjects = getSubjectsByIds([subjectId]);
                          const subject = subjects[0];
                          return subject ? (
                            <li key={subjectId} className="py-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {subject.name}
                              </h4>
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {subject.description}
                              </p>
                              {subject.topics && subject.topics.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {subject.topics.map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    )}
                  </div>
                </div>
                {/* Can Learn Section */}{' '}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-green-500 dark:bg-green-600">
                    <h3 className="text-lg font-bold text-white">Can Learn</h3>
                    <p className="text-green-100 text-sm">
                      Additional subjects for specialization
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-green-200 dark:divide-green-800">
                        {selectedCareer.canLearnIds.map((subjectId) => {
                          const subjects = getSubjectsByIds([subjectId]);
                          const subject = subjects[0];
                          return subject ? (
                            <li key={subjectId} className="py-4">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {subject.name}
                              </h4>
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {subject.description}
                              </p>
                              {subject.topics && subject.topics.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {subject.topics.map((topic, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>{' '}
              <div className="mt-8 text-center space-x-4">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() =>
                    router.push(`/dashboard?career=${selectedCareerId}`)
                  }
                >
                  Start Learning These Subjects
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}{' '}
          <div className="mt-20 pb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Not sure what you want to be yet?
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
                Explore these popular career paths to find your perfect match
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {careerPathways.map((career) => (
                <div
                  key={career.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                  onClick={() => {
                    setSelectedCareerId(career.id);
                    // Scroll to the career details section
                    document
                      .getElementById('career-details')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="px-6 py-6">
                    <div className="mb-4 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-600 dark:text-indigo-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {career.title}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {career.description}
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      View subjects
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

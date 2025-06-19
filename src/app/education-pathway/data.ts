import { EducationPathway } from './types';

export const pathwayData: EducationPathway[] = [
  {
    id: '1',
    career: 'Software Engineer',
    description:
      'Design, develop, and maintain software systems and applications',
    careerOutlook: {
      demand: 'high',
      salaryRange: {
        min: 3500,
        max: 15000,
      },
      growthOutlook:
        'Projected 22% growth over the next decade due to continued digital transformation and emerging technologies.',
    },
    pathways: [
      {
        level: 'pre-university',
        title: 'Pre-University Options',
        description:
          'Foundation programs typically take 1 year, while diplomas might take 2-3 years before you can pursue a degree.',
        duration: '1-3 years',
        options: [
          {
            name: 'STPM',
            description:
              'The Malaysian Higher School Certificate is equivalent to A-Levels and recognized for university admission.',
            advantages: [
              'Most affordable option',
              'Widely recognized by Malaysian public universities',
              'Strong academic foundation',
            ],
            challenges: [
              'Highly competitive',
              'Intense academic pressure',
              'Less specialized preparation for computer science',
            ],
            requirements: [
              'Strong SPM results with credits in Mathematics and Science subjects',
            ],
          },
          {
            name: 'Foundation in Computing/IT',
            institutions: [
              'Sunway University',
              "Taylor's University",
              'INTI International University',
              'Multimedia University (MMU)',
            ],
            description:
              'Specialized foundation program focusing on computer science fundamentals.',
            advantages: [
              'Direct pathway to related degrees',
              'Fundamental computing knowledge',
              'Shorter duration (1 year)',
              'Preparation for technical degrees',
            ],
            challenges: [
              'Higher cost than STPM',
              'Usually only valid for specific institutions',
              'May have limitations for changing fields later',
            ],
            requirements: [
              'Minimum 5 credits in SPM including Mathematics and a Science subject',
            ],
          },
          {
            name: 'Diploma in Computer Science',
            institutions: [
              'Tunku Abdul Rahman University College (TARUC)',
              'Polytechnics',
              'Universiti Teknologi MARA (UiTM)',
            ],
            description:
              'A 2-3 year program providing hands-on technical training in computing.',
            advantages: [
              'Practical skills development',
              'Possibility to work after diploma before continuing degree',
              'Option to skip some degree subjects via credit transfer',
            ],
            challenges: [
              'Longer duration before reaching degree level',
              'May require additional bridging courses for some universities',
            ],
            requirements: ['Minimum 3-5 credits in SPM including Mathematics'],
          },
        ],
      },
      {
        level: 'bachelor',
        title: "Bachelor's Degree",
        description:
          "A bachelor's degree in Computer Science or Software Engineering is the standard requirement for most software engineering roles.",
        duration: '3-4 years',
        options: [
          {
            name: 'Bachelor of Computer Science',
            institutions: [
              'Universiti Malaya (UM)',
              'Universiti Sains Malaysia (USM)',
              'Monash University Malaysia',
              'Sunway University',
            ],
            description:
              'Broad theoretical and practical foundation in computing principles and programming.',
            advantages: [
              'Comprehensive understanding of computing theory',
              'Strong foundation for various tech careers',
              'Good for research-oriented interests',
            ],
            challenges: [
              'May require more self-learning for specific development skills',
              'Heavy emphasis on mathematics and theory',
            ],
          },
          {
            name: 'Bachelor of Software Engineering',
            institutions: [
              'Universiti Teknologi Malaysia (UTM)',
              'Multimedia University (MMU)',
              'Asia Pacific University (APU)',
            ],
            description:
              'Focused specifically on software development practices and engineering principles.',
            advantages: [
              'Directly relevant to software development careers',
              'Often includes industry placements',
              'More emphasis on software development lifecycle',
            ],
            challenges: [
              'Less flexibility for careers requiring broader computing knowledge',
              'Can be more intensive with project work',
            ],
          },
        ],
      },
      {
        level: 'professional-cert',
        title: 'Professional Certifications',
        description:
          'Industry certifications can significantly enhance job prospects and demonstrate specialized skills.',
        duration: 'Variable',
        options: [
          {
            name: 'AWS Certified Developer',
            description:
              'Certification for developing applications on Amazon Web Services.',
            advantages: [
              'Highly valued in cloud development',
              'Can lead to higher paying roles',
              'Demonstrates practical skills',
            ],
            challenges: [
              'Requires regular renewal',
              'Technology changes rapidly',
            ],
            link: 'https://aws.amazon.com/certification/certified-developer-associate/',
          },
          {
            name: 'Microsoft Certified: Azure Developer Associate',
            description:
              'Certification for developing solutions on Microsoft Azure.',
            advantages: [
              'Recognition in Microsoft ecosystem companies',
              'Demonstrates cloud expertise',
              'Can open doors for enterprise development',
            ],
            challenges: [
              'Platform-specific knowledge',
              'Regular updates required',
            ],
            link: 'https://learn.microsoft.com/en-us/certifications/azure-developer/',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    career: 'Doctor / Medical Practitioner',
    description:
      'Diagnose and treat illnesses, diseases and medical conditions',
    careerOutlook: {
      demand: 'high',
      salaryRange: {
        min: 4000,
        max: 25000,
      },
      growthOutlook:
        "Consistent demand with Malaysia's growing and aging population, especially in specialized fields.",
    },
    pathways: [
      {
        level: 'pre-university',
        title: 'Pre-University Options',
        description:
          'A strong foundation in science subjects is critical for medical school admission.',
        duration: '1-2 years',
        options: [
          {
            name: 'STPM',
            description:
              'The Malaysian Higher School Certificate with a focus on Biology, Chemistry, and Physics.',
            advantages: [
              'Most affordable pathway',
              'Widely accepted for public university medical schools',
              'Builds strong academic discipline',
            ],
            challenges: [
              'Extremely competitive for medical school placement',
              'Requires near-perfect grades',
              'Intense academic pressure',
            ],
            requirements: [
              "Minimum 20A's in SPM including Biology, Chemistry, Physics, Mathematics/Additional Mathematics, and Bahasa Malaysia/English",
            ],
          },
          {
            name: 'Foundation in Science',
            institutions: [
              'International Medical University (IMU)',
              'UCSI University',
              "Taylor's University",
              'Monash University',
            ],
            description:
              'Specialized foundation program designed for medical and health science pathways.',
            advantages: [
              'Targeted preparation for medical school',
              'More supportive transition to university',
              'Often provides guaranteed pathways to specific medical programs',
            ],
            challenges: [
              'Higher cost than STPM',
              'Usually only valid for specific institutions',
              'Still competitive for medical placement',
            ],
            requirements: [
              "Minimum 5A's in SPM including Biology, Chemistry, Physics, Mathematics/Additional Mathematics",
            ],
          },
          {
            name: 'A-Levels',
            institutions: [
              "Taylor's College",
              'Methodist College Kuala Lumpur',
              "Kolej Tuanku Ja'afar",
            ],
            description:
              'International pre-university qualification focusing on Biology, Chemistry, and Physics.',
            advantages: [
              'Internationally recognized',
              'Excellent preparation for overseas medical schools',
              'Provides strong theoretical knowledge',
            ],
            challenges: [
              'Higher cost',
              'Very examination-focused',
              'Intensive workload',
            ],
            requirements: [
              "Minimum 5A's in SPM including Biology, Chemistry, Physics, Mathematics",
            ],
          },
        ],
      },
      {
        level: 'bachelor',
        title: 'Medical Degree (MBBS/MD)',
        description:
          'A medical degree is required to become a qualified doctor, typically lasting 5-6 years.',
        duration: '5-6 years',
        options: [
          {
            name: 'MBBS at Local Public Universities',
            institutions: [
              'Universiti Malaya (UM)',
              'Universiti Sains Malaysia (USM)',
              'Universiti Kebangsaan Malaysia (UKM)',
            ],
            description:
              'Bachelor of Medicine, Bachelor of Surgery program at Malaysian public universities.',
            advantages: [
              'More affordable than private options',
              'Strong reputation locally',
              'Established clinical training networks',
            ],
            challenges: [
              'Extremely competitive admission',
              'Limited places',
              'Less flexibility in curriculum',
            ],
          },
          {
            name: 'MBBS at Local Private Universities',
            institutions: [
              'International Medical University (IMU)',
              'UCSI University',
              'Monash University Malaysia',
              'Manipal Medical College',
            ],
            description:
              'Medical programs offered by private institutions in Malaysia.',
            advantages: [
              'More places available',
              'Sometimes offer international partnerships',
              'May have more modern facilities',
            ],
            challenges: [
              'Higher cost',
              'Variable reputation depending on institution',
              'Still need to pass national licensing exam',
            ],
          },
          {
            name: 'Overseas Medical Degree',
            institutions: [
              'UK universities',
              'Australian universities',
              'Irish universities',
              'Universities in Eastern Europe or Russia',
            ],
            description:
              'Studying medicine abroad with plans to return to Malaysia to practice.',
            advantages: [
              'International exposure',
              'Some prestigious programs',
              'Different medical systems experience',
            ],
            challenges: [
              'Very high cost',
              'Need for adaptation when returning to Malaysia',
              'Must pass Malaysian Medical Council qualification exam to practice in Malaysia',
            ],
          },
        ],
      },
      {
        level: 'professional-cert',
        title: 'Housemanship and Medical Officer Training',
        description:
          'After graduation, all doctors must complete a mandatory housemanship (internship) to be fully registered.',
        duration: '2+ years',
        options: [
          {
            name: 'Housemanship',
            description:
              'Mandatory 2-year training in public hospitals rotating through various departments.',
            advantages: [
              'Practical experience under supervision',
              'Pathway to full registration',
              'Exposure to different specialties',
            ],
            challenges: [
              'High pressure and long hours',
              'Competitive placement for preferred hospitals',
              'Steep learning curve',
            ],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    career: 'Accountant',
    description:
      'Prepare and examine financial records and ensure accuracy of financial statements',
    careerOutlook: {
      demand: 'medium',
      salaryRange: {
        min: 3000,
        max: 12000,
      },
      growthOutlook:
        'Stable demand with increased focus on specialized accounting skills like forensic accounting, sustainability reporting and financial technology.',
    },
    pathways: [
      {
        level: 'pre-university',
        title: 'Pre-University Options',
        description:
          'A good foundation in mathematics and business studies is beneficial for accounting.',
        duration: '1-2.5 years',
        options: [
          {
            name: 'STPM',
            description:
              'Malaysian Higher School Certificate with a focus on Accounting, Mathematics, and Economics.',
            advantages: [
              'Most affordable option',
              'Well-recognized by public universities',
              'Provides strong academic foundation',
            ],
            challenges: [
              'Competitive for top university placements',
              'Less specialized for accounting career',
            ],
            requirements: ['Credits in Mathematics and English in SPM'],
          },
          {
            name: 'Foundation in Business/Accounting',
            institutions: [
              'Sunway University',
              "Taylor's University",
              'INTI International University',
            ],
            description:
              'Specialized foundation program focused on business and accounting fundamentals.',
            advantages: [
              'Direct pathway to accounting degrees',
              'Introduction to accounting principles',
              'Shorter duration (1 year)',
            ],
            challenges: [
              'Higher cost than STPM',
              'Usually only valid for specific institutions',
            ],
            requirements: [
              'Minimum 5 credits in SPM including Mathematics and English',
            ],
          },
          {
            name: 'Diploma in Accounting',
            institutions: [
              'Tunku Abdul Rahman University College (TARUC)',
              'Politeknik',
              'Sunway College',
            ],
            description:
              'A 2-2.5 year program providing practical training in accounting.',
            advantages: [
              'Practical skills development',
              'Can start working after diploma',
              'Exemptions for some professional papers',
            ],
            challenges: [
              'Longer duration before reaching professional qualification',
              'May require additional subjects for degree conversion',
            ],
            requirements: ['Minimum 3 credits in SPM including Mathematics'],
          },
        ],
      },
      {
        level: 'bachelor',
        title: "Bachelor's Degree in Accounting",
        description:
          'A degree in accounting provides the knowledge and skills needed to pursue professional accounting qualifications.',
        duration: '3-4 years',
        options: [
          {
            name: 'Bachelor of Accounting (Local Universities)',
            institutions: [
              'Universiti Malaya (UM)',
              'Universiti Kebangsaan Malaysia (UKM)',
              'Universiti Putra Malaysia (UPM)',
            ],
            description:
              'Accredited accounting degree programs at public universities.',
            advantages: [
              'More affordable',
              'Recognized by Malaysian Institute of Accountants (MIA)',
              'Often includes industrial training',
            ],
            challenges: ['Competitive admission', 'Limited places'],
          },
          {
            name: 'Bachelor of Accounting (Private Universities)',
            institutions: [
              'Sunway University',
              "Taylor's University",
              'HELP University',
            ],
            description:
              'Accounting degree programs at private institutions, often with international partnerships.',
            advantages: [
              'More places available',
              'May offer double degrees or international options',
              'Sometimes better industry connections',
            ],
            challenges: ['Higher cost', 'Need to ensure MIA recognition'],
          },
        ],
      },
      {
        level: 'professional-cert',
        title: 'Professional Qualifications',
        description:
          'Professional accounting qualifications are often required for career advancement and specialization.',
        duration: '2-4 years (part-time)',
        options: [
          {
            name: 'ACCA (Association of Chartered Certified Accountants)',
            description:
              'Globally recognized accounting qualification with broad career opportunities.',
            advantages: [
              'International recognition',
              'Flexibility to work in different countries',
              'Broad coverage of accounting topics',
            ],
            challenges: [
              'Multiple examination levels',
              'Can take several years to complete while working',
            ],
            link: 'https://www.accaglobal.com',
          },
          {
            name: 'CPA Australia',
            description:
              'Professional accounting designation recognized throughout Australia and Asia-Pacific.',
            advantages: [
              'Strong recognition in Asia-Pacific',
              'Good for those interested in working in Australia',
              'Progressive professional development',
            ],
            challenges: [
              'Requires ongoing membership and CPD',
              'Less widely known outside Asia-Pacific',
            ],
            link: 'https://www.cpaaustralia.com.au',
          },
          {
            name: 'MICPA (Malaysian Institute of Certified Public Accountants)',
            description:
              'Local professional qualification with strong domestic recognition.',
            advantages: [
              'Specifically designed for Malaysian context',
              'Strong local network',
              'Joint program with CAANZ for international recognition',
            ],
            challenges: [
              'Less global recognition than some other qualifications',
              'Rigorous examination process',
            ],
            link: 'https://www.micpa.com.my',
          },
        ],
      },
    ],
  },
];

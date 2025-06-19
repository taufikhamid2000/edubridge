import { CareerPathway } from './types';

// Career pathways data with real SPM subject IDs from the database
// Keeping only the three careers with comprehensive subject lists
export const careerPathways: CareerPathway[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    description:
      'Design, develop, and maintain software systems and applications in the Malaysian tech industry',
    mustLearnIds: [
      'c38580e8-c539-43e7-b717-209bcabc410c', // Mathematics
      '64b9676d-ac30-4252-972b-d7468098c296', // Matematik Tambahan
      '4cbe13aa-736b-4701-babf-e0a2d6d22835', // Fizik
      '8dbabf92-c5ef-4c7a-a892-e885805d2d10', // Sains Komputer
      'c17e2fa5-c316-4aaa-b745-4e84d050461d', // English
    ],
    shouldLearnIds: [
      '15b85cd5-c903-4d27-94c0-46c8bce209b0', // Science
      '850b76bc-73dd-4045-b48e-7729e5b91a6a', // Kimia
      '9e0d6b29-6cad-4eea-b8ed-8ff8b192ac0a', // Bahasa Melayu
      'd62ee9d1-cf0c-4c47-8928-4f9aa267eca5', // Ekonomi
      '48d23760-c184-4c3e-931a-9818e380edf0', // Pengajian Kejuruteraan Elektrik & Elektronik
      '8de8447c-ee99-433d-bf3d-583cc93f1fb1', // Pengajian Kejuruteraan Mekanikal
      '6f6f104f-5b2b-48e6-aef2-e52a9a3c79e0', // Sains Tambahan
    ],
    canLearnIds: [
      '3475aa6b-945f-4953-9bcd-1f9206c5ec21', // Pendidikan Seni Visual
      '87505465-cd92-4339-88c5-58061e06f3e4', // Biologi
      '6422ddab-5d94-4aa3-b17e-95a7be82dbb1', // Prinsip Perakaunan
      'f344c1a5-8291-4677-b29e-49157c582f83', // Lukisan Kejuruteraan
      '7f3c27c3-87d1-4012-a490-67aef51fe508', // Reka Bentuk
      '761b2421-9a44-47a6-b45f-1ea380f5fee9', // Sejarah
      'a3af451f-c6f6-421c-ba75-dc8488d1dfb3', // Geografi
      'ef28afe8-c943-4b9e-9609-8ff068d183db', // Pengajian Keusahawanan
      'cfc3b402-315b-45fa-8716-75cfdd1185bd', // Asas Kemampanan
    ],
  },
  {
    id: 'medical-doctor',
    title: 'Medical Doctor',
    description:
      'Diagnose and treat illnesses in Malaysian hospitals and healthcare institutions',
    mustLearnIds: [
      '87505465-cd92-4339-88c5-58061e06f3e4', // Biologi
      '850b76bc-73dd-4045-b48e-7729e5b91a6a', // Kimia
      '4cbe13aa-736b-4701-babf-e0a2d6d22835', // Fizik
      'c38580e8-c539-43e7-b717-209bcabc410c', // Mathematics
      '64b9676d-ac30-4252-972b-d7468098c296', // Matematik Tambahan
      'c17e2fa5-c316-4aaa-b745-4e84d050461d', // English
    ],
    shouldLearnIds: [
      '9e0d6b29-6cad-4eea-b8ed-8ff8b192ac0a', // Bahasa Melayu
      '15b85cd5-c903-4d27-94c0-46c8bce209b0', // Science
      'e738de6d-a90c-429c-90f1-82e44ea59e9c', // Sains Sukan
      '7cf7c776-28a6-49ab-a149-1716d353e97c', // Bahasa Arab
      'dd2796a2-7138-4d76-a78e-caef6131c57c', // Pendidikan Islam
      '6f6f104f-5b2b-48e6-aef2-e52a9a3c79e0', // Sains Tambahan
      '20a5293b-84e9-4825-889d-62e28a7a0441', // Sains Rumah Tangga
    ],
    canLearnIds: [
      '761b2421-9a44-47a6-b45f-1ea380f5fee9', // Sejarah
      'de1e094e-37c2-4718-930c-0b8998b3efeb', // Pendidikan Moral
      'cd31c143-7de6-430e-9cb0-599b2b85d352', // Pertanian
      'a3af451f-c6f6-421c-ba75-dc8488d1dfb3', // Geografi
      'd62ee9d1-cf0c-4c47-8928-4f9aa267eca5', // Ekonomi
      '25dce3c6-5e97-4b35-84fb-866a0a4eb86e', // Pendidikan Muzik
      '8dbabf92-c5ef-4c7a-a892-e885805d2d10', // Sains Komputer
      'af1bc538-21cb-40a2-92f1-469d3ba70999', // Tasawwur Islam
      'ea844278-703d-4f0d-8f88-8832a0d1a884', // Pendidikan Al‑Quran & As‑Sunnah
    ],
  },
  {
    id: 'business-manager',
    title: 'Business Manager',
    description:
      'Manage operations and strategy for Malaysian companies and organizations',
    mustLearnIds: [
      'd62ee9d1-cf0c-4c47-8928-4f9aa267eca5', // Ekonomi
      'c38580e8-c539-43e7-b717-209bcabc410c', // Mathematics
      'c17e2fa5-c316-4aaa-b745-4e84d050461d', // English
      '9e0d6b29-6cad-4eea-b8ed-8ff8b192ac0a', // Bahasa Melayu
      '101ab8fc-86ac-470c-933a-5012db064755', // Perniagaan
      '6422ddab-5d94-4aa3-b17e-95a7be82dbb1', // Prinsip Perakaunan
    ],
    shouldLearnIds: [
      'ef28afe8-c943-4b9e-9609-8ff068d183db', // Pengajian Keusahawanan
      '761b2421-9a44-47a6-b45f-1ea380f5fee9', // Sejarah
      '64b9676d-ac30-4252-972b-d7468098c296', // Matematik Tambahan
      '8dbabf92-c5ef-4c7a-a892-e885805d2d10', // Sains Komputer
      'de1e094e-37c2-4718-930c-0b8998b3efeb', // Pendidikan Moral
      'cfc3b402-315b-45fa-8716-75cfdd1185bd', // Asas Kemampanan
      '9e70c344-e80a-42bb-9b3b-b3d583152ec7', // Kesusasteraan Inggeris
      'c1fd5dbf-1f26-4186-aef0-3ee43ba3b298', // Kesusasteraan Melayu Komunikatif
    ],
    canLearnIds: [
      '4cbe13aa-736b-4701-babf-e0a2d6d22835', // Fizik
      '850b76bc-73dd-4045-b48e-7729e5b91a6a', // Kimia
      '87505465-cd92-4339-88c5-58061e06f3e4', // Biologi
      '15b85cd5-c903-4d27-94c0-46c8bce209b0', // Science
      '3475aa6b-945f-4953-9bcd-1f9206c5ec21', // Pendidikan Seni Visual
      'a3af451f-c6f6-421c-ba75-dc8488d1dfb3', // Geografi
      'dd2796a2-7138-4d76-a78e-caef6131c57c', // Pendidikan Islam
      '7f3c27c3-87d1-4012-a490-67aef51fe508', // Reka Bentuk
      '7ad65b5c-54dd-47bf-8b02-9771cd5da979', // Bahasa Cina
      'e0b62050-4c80-4c14-9d25-9102aa910fa1', // Bahasa Tamil
      '1a9ca979-a713-499c-b1ac-8a553d456aa0', // Bahasa Perancis
    ],
  },
];

// Mapping actual SPM subject IDs from the database to subject names
export const subjectMapping: Record<
  string,
  { name: string; description: string; topics: string[] }
> = {
  // Mathematics and Sciences
  'c38580e8-c539-43e7-b717-209bcabc410c': {
    name: 'Mathematics',
    description: '',
    topics: [],
  },
  '64b9676d-ac30-4252-972b-d7468098c296': {
    name: 'Matematik Tambahan',
    description: '',
    topics: [],
  },
  '4cbe13aa-736b-4701-babf-e0a2d6d22835': {
    name: 'Fizik',
    description: '',
    topics: [],
  },
  '850b76bc-73dd-4045-b48e-7729e5b91a6a': {
    name: 'Kimia',
    description: '',
    topics: [],
  },
  '87505465-cd92-4339-88c5-58061e06f3e4': {
    name: 'Biologi',
    description: '',
    topics: [],
  },
  '15b85cd5-c903-4d27-94c0-46c8bce209b0': {
    name: 'Science',
    description: '',
    topics: [],
  },
  '6f6f104f-5b2b-48e6-aef2-e52a9a3c79e0': {
    name: 'Sains Tambahan',
    description: '',
    topics: [],
  },
  '8dbabf92-c5ef-4c7a-a892-e885805d2d10': {
    name: 'Sains Komputer',
    description: '',
    topics: [],
  },

  // Languages
  'c17e2fa5-c316-4aaa-b745-4e84d050461d': {
    name: 'English',
    description: '',
    topics: [],
  },
  '9e0d6b29-6cad-4eea-b8ed-8ff8b192ac0a': {
    name: 'Bahasa Melayu',
    description: '',
    topics: [],
  },
  '7ad65b5c-54dd-47bf-8b02-9771cd5da979': {
    name: 'Bahasa Cina',
    description: '',
    topics: [],
  },
  'e0b62050-4c80-4c14-9d25-9102aa910fa1': {
    name: 'Bahasa Tamil',
    description: '',
    topics: [],
  },
  '9e16c593-b987-4586-ae0b-f68c8240fc50': {
    name: 'Bahasa Iban',
    description: '',
    topics: [],
  },
  '66d866e6-5a77-4701-abb7-d2404c8c1efd': {
    name: 'Bahasa Kadazandusun',
    description: '',
    topics: [],
  },
  '1eb8159d-3606-4271-9e8f-00fe26bd0ee2': {
    name: 'Bahasa Semai',
    description: '',
    topics: [],
  },
  '931ddbe8-0bb1-4e0b-90a2-e294db7ed03f': {
    name: 'Bahasa Jepun',
    description: '',
    topics: [],
  },
  '77d1bfcb-3ef9-48d0-a0cc-92f18ea3708f': {
    name: 'Bahasa Jerman',
    description: '',
    topics: [],
  },
  'cd03e2d4-60ba-40ab-bc7f-d48279fa76f6': {
    name: 'Bahasa Korea',
    description: '',
    topics: [],
  },
  '73ce79da-8dbd-432e-be54-8ff531304e63': {
    name: 'Bahasa Cina Komunikatif',
    description: '',
    topics: [],
  },
  '7cf7c776-28a6-49ab-a149-1716d353e97c': {
    name: 'Bahasa Arab',
    description: '',
    topics: [],
  },
  '1a9ca979-a713-499c-b1ac-8a553d456aa0': {
    name: 'Bahasa Perancis',
    description: '',
    topics: [],
  },
  '6d629b8e-a6f9-42e0-8d19-d74e20a70fe5': {
    name: 'Bahasa Punjabi',
    description: '',
    topics: [],
  },

  // Humanities and Social Studies
  '761b2421-9a44-47a6-b45f-1ea380f5fee9': {
    name: 'Sejarah',
    description: '',
    topics: [],
  },
  'de1e094e-37c2-4718-930c-0b8998b3efeb': {
    name: 'Pendidikan Moral',
    description: '',
    topics: [],
  },
  'dd2796a2-7138-4d76-a78e-caef6131c57c': {
    name: 'Pendidikan Islam',
    description: '',
    topics: [],
  },
  'a3af451f-c6f6-421c-ba75-dc8488d1dfb3': {
    name: 'Geografi',
    description: '',
    topics: [],
  },
  'af1bc538-21cb-40a2-92f1-469d3ba70999': {
    name: 'Tasawwur Islam',
    description: '',
    topics: [],
  },
  'ea844278-703d-4f0d-8f88-8832a0d1a884': {
    name: 'Pendidikan Al‑Quran & As‑Sunnah',
    description: '',
    topics: [],
  },
  '3a72c9cc-c739-4299-8efe-bd8b9997534f': {
    name: 'Pendidikan Syariah Islamiah',
    description: '',
    topics: [],
  },

  // Arts and Technical Subjects
  '3475aa6b-945f-4953-9bcd-1f9206c5ec21': {
    name: 'Pendidikan Seni Visual',
    description: '',
    topics: [],
  },
  '25dce3c6-5e97-4b35-84fb-866a0a4eb86e': {
    name: 'Pendidikan Muzik',
    description: '',
    topics: [],
  },
  'e738de6d-a90c-429c-90f1-82e44ea59e9c': {
    name: 'Sains Sukan',
    description: '',
    topics: [],
  },
  '55ea479a-12a5-4a57-b080-dbee40e8b6e9': {
    name: 'Seni Komunikasi Teknikal',
    description: '',
    topics: [],
  },
  'f344c1a5-8291-4677-b29e-49157c582f83': {
    name: 'Lukisan Kejuruteraan',
    description: '',
    topics: [],
  },

  // Business, Economics and Accounting
  'ef28afe8-c943-4b9e-9609-8ff068d183db': {
    name: 'Pengajian Keusahawanan',
    description: '',
    topics: [],
  },
  '101ab8fc-86ac-470c-933a-5012db064755': {
    name: 'Perniagaan',
    description: '',
    topics: [],
  },
  '6422ddab-5d94-4aa3-b17e-95a7be82dbb1': {
    name: 'Prinsip Perakaunan',
    description: '',
    topics: [],
  },
  'd62ee9d1-cf0c-4c47-8928-4f9aa267eca5': {
    name: 'Ekonomi',
    description: '',
    topics: [],
  },

  // Literature
  '9e70c344-e80a-42bb-9b3b-b3d583152ec7': {
    name: 'Kesusasteraan Inggeris',
    description: '',
    topics: [],
  },
  'c1fd5dbf-1f26-4186-aef0-3ee43ba3b298': {
    name: 'Kesusasteraan Melayu Komunikatif',
    description: '',
    topics: [],
  },
  '4fccfd83-6551-4f97-9a29-ea09d7d1352c': {
    name: 'Kesusasteraan Cina',
    description: '',
    topics: [],
  },
  '5e541538-de90-443b-ae6e-7e9d8f021e6b': {
    name: 'Kesusasteraan Tamil',
    description: '',
    topics: [],
  },

  // Engineering and Technical
  '8d1fad34-b989-4a9d-ad68-ca021b54f488': {
    name: 'Pengajian Kejuruteraan Awam',
    description: '',
    topics: [],
  },
  '48d23760-c184-4c3e-931a-9818e380edf0': {
    name: 'Pengajian Kejuruteraan Elektrik & Elektronik',
    description: '',
    topics: [],
  },
  '8de8447c-ee99-433d-bf3d-583cc93f1fb1': {
    name: 'Pengajian Kejuruteraan Mekanikal',
    description: '',
    topics: [],
  },
  'f04ebfb1-a4e4-410a-a229-23339192aaca': {
    name: 'Kimpalan Arka & Gas',
    description: '',
    topics: [],
  },
  'dad68a0f-3a0b-4698-8902-c46f9f70cccf': {
    name: 'Pendawaian Rumah',
    description: '',
    topics: [],
  },
  'd70a455a-e205-44b1-b1dc-09c73a8afdb3': {
    name: 'Pembinaan Rumah',
    description: '',
    topics: [],
  },
  '802be6a5-9129-4f98-b2f8-721a22fedb7f': {
    name: 'Pembuatan Perabot',
    description: '',
    topics: [],
  },
  'af28982c-e629-41bf-888a-19fc57035e8e': {
    name: 'Kerja Paip Rumah',
    description: '',
    topics: [],
  },

  // Other
  '7f3c27c3-87d1-4012-a490-67aef51fe508': {
    name: 'Reka Bentuk',
    description: '',
    topics: [],
  },
  'cfc3b402-315b-45fa-8716-75cfdd1185bd': {
    name: 'Asas Kemampanan',
    description: '',
    topics: [],
  },
  '20a5293b-84e9-4825-889d-62e28a7a0441': {
    name: 'Sains Rumah Tangga',
    description: '',
    topics: [],
  },
  'cd31c143-7de6-430e-9cb0-599b2b85d352': {
    name: 'Pertanian',
    description: '',
    topics: [],
  },
};

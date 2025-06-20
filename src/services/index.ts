// Centralized export file for all content-related services

// Admin Auth Service
export { verifyAdminAccess, checkAdminAccess } from './adminAuthService';

// Pathway Comments Service
export {
  PathwayCommentService,
  type PathwayComment,
  type CreatePathwayCommentParams,
} from './pathwayCommentService';

// Career Comments Service
export {
  CareerCommentService,
  type CareerComment,
  type CreateCareerCommentParams,
} from './careerCommentService';

// Subject Service
export {
  type Subject,
  fetchAdminSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from './subjectService';

// Chapter Service
export {
  type Chapter,
  fetchAdminChapters,
  createChapter,
  updateChapter,
  deleteChapter,
} from './chapterService';

// Topic Service
export {
  type Topic,
  fetchAdminTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from './topicService';

// Quiz Service
export {
  type Quiz,
  type QuizQuestion,
  fetchQuizzes,
  submitQuiz,
  fetchAdminQuizzes,
  createAdminQuiz,
  deleteQuiz,
} from './quizService';

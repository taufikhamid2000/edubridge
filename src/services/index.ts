// Centralized export file for all content-related services

// Admin Auth Service
export { verifyAdminAccess, checkAdminAccess } from './adminAuthService';

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

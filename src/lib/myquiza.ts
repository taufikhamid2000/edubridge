const BASE_URL = process.env.MYQUIZA_API_URL ?? '';

// ---- Types ----

export interface MyQuizaQuiz {
  id: string;
  topicId: string;
  name: string;
  verified: boolean;
  questionCount: number;
  difficulty: string | null;
  isPublic: boolean;
}

export interface QuizDetailOption {
  id: string;
  text: string;
  orderIndex: number;
}

export interface QuizDetailQuestion {
  id: string;
  text: string;
  type: string; // "radio" | "checkbox"
  orderIndex: number;
  options: QuizDetailOption[];
}

export interface QuizDetail {
  id: string;
  topicId: string;
  name: string;
  verified: boolean;
  timeLimit: number | null; // seconds; null -> client falls back to default
  difficulty: string | null;
  isPublic: boolean;
  questions: QuizDetailQuestion[];
}

export interface CreateQuizPayload {
  topicId: string;
  name: string;
  timeLimit?: number;
  difficulty?: string;
  isPublic?: boolean;
}

export interface UpdateQuizPayload {
  name?: string;
  difficulty?: string;
  timeLimit?: number;
  isPublic?: boolean;
}

// Author-only view of a quiz: same shape as QuizDetail but answer options
// carry `isCorrect` (never exposed on the public quiz-detail endpoint).
export interface QuizAuthorOption extends QuizDetailOption {
  isCorrect: boolean;
}

export interface QuizAuthorQuestion extends Omit<QuizDetailQuestion, 'options'> {
  options: QuizAuthorOption[];
}

export interface QuizAuthorDetail extends Omit<QuizDetail, 'questions'> {
  questions: QuizAuthorQuestion[];
}

export interface CreateQuestionPayload {
  text: string;
  type: 'radio' | 'checkbox';
  orderIndex: number;
  answers: Array<{ text: string; isCorrect: boolean; orderIndex: number }>;
}

export interface UpdateQuestionPayload {
  text?: string;
  type?: 'radio' | 'checkbox';
  orderIndex?: number;
}

export interface CreateAnswerPayload {
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface UpdateAnswerPayload {
  text?: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

export interface SubmitAttemptPayload {
  answers: Array<{
    questionId: string;
    selectedAnswerIds: string[];
  }>;
  timeTaken?: number;
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  maxScore: number;
  xpAwarded: boolean;
  // Per-question correctness, ordered by question orderIndex. Returned only in
  // the attempt response (post-submission) — the answer key stays hidden on
  // the quiz-detail endpoint. correctAnswerIds lists the option ids that were
  // correct, for highlighting on the results screen.
  questions?: Array<{
    questionId: string;
    correct: boolean;
    correctAnswerIds: string[];
  }>;
}

export interface UpdateMePayload {
  displayName?: string;
  avatarUrl?: string;
}

// Audit comments: identical shape on quizzes/questions/answers, per MyQuiza.
export type AuditEntityType = 'quizzes' | 'questions' | 'answers';

export interface MyQuizaAuditComment {
  id: string;
  commentText: string;
  commentType: 'suggestion' | 'issue' | 'approved' | 'rejected';
  isResolved: boolean;
  createdAt: string;
}

export interface CreateAuditCommentPayload {
  commentText: string;
  commentType: 'suggestion' | 'issue' | 'approved' | 'rejected';
}

export interface MyQuizaVerificationLogEntry {
  id: string;
  action: 'verified' | 'unverified';
  reason: string | null;
  createdAt: string;
}

export interface TopicProgress {
  topicId: string | null;
  status: string | null;
  score: number | null;
  attempts: number | null;
  lastAttemptedAt: string | null;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  weeklyXp: number;
}

// ---- Core fetch ----

async function myquizaFetch<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`MyQuiza ${res.status}: ${path}`);
  }

  // PATCH/DELETE may return 204 No Content or an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ---- Endpoints ----

export function createQuiz(payload: CreateQuizPayload, token: string | null) {
  return myquizaFetch<{ id: string }>('/api/v1/quizzes', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTopicQuizzes(topicId: string) {
  return myquizaFetch<MyQuizaQuiz[]>(`/api/v1/topics/${topicId}/quizzes`, null);
}

export function getQuizDetail(quizId: string) {
  return myquizaFetch<QuizDetail>(`/api/v1/quizzes/${quizId}`, null);
}

// Author/moderator-only quiz view — includes isCorrect on every answer.
// Use for the quiz editor; never expose this response to non-owners.
export function getQuizAuthorDetail(quizId: string, token: string | null) {
  return myquizaFetch<QuizAuthorDetail>(`/api/v1/quizzes/${quizId}/author`, token);
}

export function updateQuiz(
  quizId: string,
  payload: UpdateQuizPayload,
  token: string | null
) {
  return myquizaFetch<QuizDetail>(`/api/v1/quizzes/${quizId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function createQuestion(
  quizId: string,
  payload: CreateQuestionPayload,
  token: string | null
) {
  return myquizaFetch<{ id: string }>(`/api/v1/quizzes/${quizId}/questions`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateQuestion(
  questionId: string,
  payload: UpdateQuestionPayload,
  token: string | null
) {
  return myquizaFetch<void>(`/api/v1/questions/${questionId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteQuestion(questionId: string, token: string | null) {
  return myquizaFetch<void>(`/api/v1/questions/${questionId}`, token, {
    method: 'DELETE',
  });
}

export function createAnswer(
  questionId: string,
  payload: CreateAnswerPayload,
  token: string | null
) {
  return myquizaFetch<{ id: string }>(
    `/api/v1/questions/${questionId}/answers`,
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export function updateAnswer(
  answerId: string,
  payload: UpdateAnswerPayload,
  token: string | null
) {
  return myquizaFetch<void>(`/api/v1/answers/${answerId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAnswer(answerId: string, token: string | null) {
  return myquizaFetch<void>(`/api/v1/answers/${answerId}`, token, {
    method: 'DELETE',
  });
}

export function getAuditComments(
  entity: AuditEntityType,
  entityId: string,
  token: string | null
) {
  return myquizaFetch<MyQuizaAuditComment[]>(
    `/api/v1/${entity}/${entityId}/comments`,
    token
  );
}

export function addAuditComment(
  entity: AuditEntityType,
  entityId: string,
  payload: CreateAuditCommentPayload,
  token: string | null
) {
  return myquizaFetch<MyQuizaAuditComment>(
    `/api/v1/${entity}/${entityId}/comments`,
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export function resolveAuditComment(
  entity: AuditEntityType,
  entityId: string,
  commentId: string,
  isResolved: boolean,
  token: string | null
) {
  return myquizaFetch<MyQuizaAuditComment>(
    `/api/v1/${entity}/${entityId}/comments/${commentId}`,
    token,
    { method: 'PATCH', body: JSON.stringify({ isResolved }) }
  );
}

export function getQuizVerificationLog(quizId: string, token: string | null) {
  return myquizaFetch<MyQuizaVerificationLogEntry[]>(
    `/api/v1/quizzes/${quizId}/verification-log`,
    token
  );
}

export interface VerifyQuizPayload {
  verified: boolean;
  feedback?: string;
}

// 204 No Content on success — auto-inserts the verification-log entry
// server-side (no separate write endpoint for the log by design).
export function verifyQuiz(
  quizId: string,
  payload: VerifyQuizPayload,
  token: string | null
) {
  return myquizaFetch<void>(`/api/v1/quizzes/${quizId}/verify`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Awarded-achievement rows (per user). A real catalog now exists too —
// see MyQuizaAchievementCatalogEntry below — but earned rows always
// snapshot title/description/icon/achievementType at award time, so
// editing the catalog later never retroactively changes past awards.
export interface MyQuizaAchievement {
  id: string;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  progress: number | null;
  maxProgress: number | null;
  earnedAt: string;
}

// Award from the catalog (server snapshots the catalog entry's fields),
// or a one-off freeform award with no catalog entry — pick one shape.
export type AwardAchievementPayload =
  | { achievementId: string; progress?: number; maxProgress?: number }
  | {
      achievementType: string;
      title: string;
      description: string;
      icon: string;
      progress?: number;
      maxProgress?: number;
    };

export function getMyAchievements(token: string | null) {
  return myquizaFetch<MyQuizaAchievement[]>('/api/v1/me/achievements', token);
}

// Moderator-only (viewing another user's achievements, not a public profile call).
export function getUserAchievements(userId: string, token: string | null) {
  return myquizaFetch<MyQuizaAchievement[]>(
    `/api/v1/users/${userId}/achievements`,
    token
  );
}

// Moderator-only.
export function awardAchievement(
  userId: string,
  payload: AwardAchievementPayload,
  token: string | null
) {
  return myquizaFetch<MyQuizaAchievement>(
    `/api/v1/users/${userId}/achievements`,
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

// Achievement catalog — template definitions admins manage, referenced by
// achievementId when awarding (see AwardAchievementPayload above).
export interface MyQuizaAchievementCatalogEntry {
  id: string;
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  maxProgress: number | null;
}

export interface CatalogAchievementPayload {
  achievementType: string;
  title: string;
  description: string;
  icon: string;
  maxProgress?: number;
}

export function getAchievementCatalog() {
  return myquizaFetch<MyQuizaAchievementCatalogEntry[]>(
    '/api/v1/achievements',
    null
  );
}

export function createCatalogAchievement(
  payload: CatalogAchievementPayload,
  token: string | null
) {
  return myquizaFetch<MyQuizaAchievementCatalogEntry>(
    '/api/v1/achievements',
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export function updateCatalogAchievement(
  id: string,
  payload: Partial<CatalogAchievementPayload>,
  token: string | null
) {
  return myquizaFetch<MyQuizaAchievementCatalogEntry>(
    `/api/v1/achievements/${id}`,
    token,
    { method: 'PATCH', body: JSON.stringify(payload) }
  );
}

export function deleteCatalogAchievement(id: string, token: string | null) {
  return myquizaFetch<void>(`/api/v1/achievements/${id}`, token, {
    method: 'DELETE',
  });
}

export function submitAttempt(
  quizId: string,
  payload: SubmitAttemptPayload,
  token: string | null
) {
  return myquizaFetch<AttemptResult>(`/api/v1/quizzes/${quizId}/attempts`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyProgress(token: string | null) {
  return myquizaFetch<TopicProgress[]>('/api/v1/me/progress', token);
}

// displayName/avatarUrl only — schoolRole is deliberately not editable here
// (privilege-escalation risk: schoolRole drives Moderator/Admin authorization).
export function updateMe(payload: UpdateMePayload, token: string | null) {
  return myquizaFetch<{ id: string }>('/api/v1/me', token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getLeaderboard(
  token: string | null,
  options: { period?: 'weekly'; limit?: number } = {}
) {
  const params = new URLSearchParams();
  if (options.period) params.set('period', options.period);
  if (options.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  return myquizaFetch<LeaderboardEntry[]>(
    `/api/v1/leaderboard${qs ? `?${qs}` : ''}`,
    token
  );
}

// Schools: reads are public (same as the user leaderboard); writes are
// admin-only, not moderator — institutional data, not user-generated
// content needing review. `type` is DB-constrained; validate client-side
// against SCHOOL_TYPES before submitting (an invalid value 500s server-side
// rather than a clean 400).
export const SCHOOL_TYPES = [
  'SMK',
  'SMKA',
  'MRSM',
  'Sekolah Sains',
  'Sekolah Sukan',
  'Sekolah Seni',
  'SBP',
  'SMJK',
  'KV',
] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export interface MyQuizaSchool {
  id: string;
  name: string;
  type: SchoolType;
  district: string;
  state: string;
  averageScore: number;
  participationRate: number;
  activeStudents: number;
}

export interface MyQuizaSchoolStats {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  lastCalculatedAt: string;
}

export interface MyQuizaSchoolDetail extends MyQuizaSchool {
  code: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  principalName: string | null;
  totalStudents: number | null;
  stats: MyQuizaSchoolStats | null;
}

export interface SchoolPayload {
  name: string;
  type: SchoolType;
  district: string;
  state: string;
  code?: string;
  address?: string;
  website?: string;
  phone?: string;
  principalName?: string;
  totalStudents?: number;
}

export function getSchools() {
  return myquizaFetch<MyQuizaSchool[]>('/api/v1/schools', null);
}

export function getSchoolDetail(id: string) {
  return myquizaFetch<MyQuizaSchoolDetail>(`/api/v1/schools/${id}`, null);
}

export function createSchool(payload: SchoolPayload, token: string | null) {
  return myquizaFetch<MyQuizaSchoolDetail>('/api/v1/schools', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSchool(
  id: string,
  payload: Partial<SchoolPayload>,
  token: string | null
) {
  return myquizaFetch<MyQuizaSchoolDetail>(`/api/v1/schools/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteSchool(id: string, token: string | null) {
  return myquizaFetch<void>(`/api/v1/schools/${id}`, token, {
    method: 'DELETE',
  });
}

// Dashboard aggregate stats, backed by MyQuiza's mv_user_dashboard_stats.
// streak/xp/level are deliberately NOT here — those are on GET /api/v1/me
// (not yet wired up on our side; still read from Supabase user_profiles).
export interface MyQuizaUserStats {
  completedQuizzes: number;
  averageScore: number;
  activeDays: number;
  weeklyQuizzes: number;
  weeklyAverageScore: number;
  lastQuizDate: string | null;
}

export function getMyStats(token: string | null) {
  return myquizaFetch<MyQuizaUserStats>('/api/v1/me/stats', token);
}

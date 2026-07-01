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

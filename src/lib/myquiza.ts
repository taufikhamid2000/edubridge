const BASE_URL = process.env.MYQUIZA_API_URL ?? '';

// ---- Types ----

export interface MyQuizaQuiz {
  id: string;
  topicId: string;
  name: string;
  verified: boolean;
  questionCount: number;
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
  questions: QuizDetailQuestion[];
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

  return res.json() as Promise<T>;
}

// ---- Endpoints ----

export function getTopicQuizzes(topicId: string) {
  return myquizaFetch<MyQuizaQuiz[]>(`/api/v1/topics/${topicId}/quizzes`, null);
}

export function getQuizDetail(quizId: string) {
  return myquizaFetch<QuizDetail>(`/api/v1/quizzes/${quizId}`, null);
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

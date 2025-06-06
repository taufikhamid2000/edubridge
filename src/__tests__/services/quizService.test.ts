// src/__tests__/services/quizService.test.ts
/// <reference types="jest" />

// Mock the entire quizService module
jest.mock('@/services/quizService', () => ({
  createQuiz: jest.fn(),
  fetchQuizzes: jest.fn(),
  submitQuiz: jest.fn(), // Changed from submitQuizAnswers to match the function name used in tests
}));

// Import the mocked functions
import {
  createQuiz,
  fetchQuizzes,
  submitQuiz, // Changed to match the mock above
} from '@/services/quizService';
import { supabase } from '@/lib/supabase';
import { jest, describe, it, expect, beforeEach } from '../../setupTests';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch with proper typing
global.fetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;

describe('Quiz Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchQuizzes', () => {
    it('fetches quizzes successfully', async () => {
      const mockQuizzes = [{ id: 1, title: 'Test Quiz' }];

      // Fixed mock implementation with proper typing
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockQuizzes,
        } as Response
      );

      const result = await fetchQuizzes(); // Changed function call
      expect(result).toEqual(mockQuizzes);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles fetch errors', async () => {
      // Fixed mock implementation typing
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(fetchQuizzes()).rejects.toThrow('Network error'); // Changed function call
    });
  });

  describe('submitQuizAnswers', () => {
    it('submits answers successfully', async () => {
      const mockResponse = { score: 80, passed: true };
      const mockAnswers = {
        quizId: 1,
        answers: [{ questionId: 1, answer: 'A' }],
      };

      // Fixed mock implementation with proper typing
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => mockResponse,
        } as Response
      );

      const result = await submitQuiz(mockAnswers); // Changed function call
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockAnswers),
        })
      );
    });
  });

  describe('createQuiz', () => {
    it('should validate quiz name is required', async () => {
      const result = await createQuiz({ name: '', topic: 'topic-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quiz name is required');
    });

    it('should validate quiz name length', async () => {
      const result = await createQuiz({ name: 'abc', topic: 'topic-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quiz name must be at least 5 characters');
    });

    it('should validate topic is required', async () => {
      const result = await createQuiz({ name: 'Valid Quiz Name', topic: '' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Topic ID is required');
    });

    it('should require authentication', async () => {
      // Mock session to return null
      jest.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await createQuiz({
        name: 'Valid Quiz Name',
        topic: 'topic-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication required');
    });

    it('should create a quiz successfully', async () => {
      // Mock authenticated session with proper User type
      jest.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00.000Z',
            },
            access_token: 'token-123',
            refresh_token: 'refresh-123',
            expires_in: 3600,
            token_type: 'bearer',
          },
        },
        error: null,
      });

      jest.mocked(supabase.from).mockReturnValue({
        // @ts-expect-error - Type issues with mock implementation
        insert: jest.fn().mockReturnValue({
          // @ts-expect-error - Type issues with mock implementation
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'quiz-123' }],
            error: null,
          }),
        }),
      });

      const result = await createQuiz({
        name: 'Valid Quiz Name',
        topic: 'topic-1',
        description: 'Quiz description',
      });

      expect(result.success).toBe(true);
      expect(result.quizId).toBe('quiz-123');
      expect(supabase.from).toHaveBeenCalledWith('quizzes');
    });

    it('should handle database errors', async () => {
      // Mock authenticated session with proper User type
      jest.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: '2023-01-01T00:00:00.000Z',
            },
            access_token: 'token-123',
            refresh_token: 'refresh-123',
            expires_in: 3600,
            token_type: 'bearer',
          },
        },
        error: null,
      });

      jest.mocked(supabase.from).mockReturnValue({
        // @ts-expect-error - Type issues with mock implementation
        insert: jest.fn().mockReturnValue({
          // @ts-expect-error - Type issues with mock implementation
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const result = await createQuiz({
        name: 'Valid Quiz Name',
        topic: 'topic-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});

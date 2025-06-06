// src/__tests__/hooks/useTopicData.test.fixed.new.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useTopicData } from '@/hooks/useTopicData';
import { supabase } from '@/lib/supabase';
import { jest, describe, it, expect, beforeEach } from '../../setupTests';
import type { Subject, Topic, Quiz, Chapter } from '@/types/topics';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
}));

// Define our response types to avoid using 'any'
interface MockResponse<T> {
  data: T | null;
  error: null | { message: string };
}

// Define the callback type for the 'then' method
type ThenCallback<T> = (value: MockResponse<T>) => void;

// Create a utility function to generate typed mocks
function createTypedMock<T>(returnValue?: MockResponse<T>) {
  // Create a mock object with method chains
  const mock = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    then: jest.fn((callback: ThenCallback<T>) => {
      callback(returnValue || { data: null, error: null });
      return mock;
    }),
  };
  return mock;
}

// Mock the Supabase client
jest.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: jest.fn((table) => {
        switch (table) {
          case 'subjects':
            return createTypedMock<Subject>();
          case 'topics':
            return createTypedMock<Topic & { chapters: unknown }>();
          case 'quizzes':
            return createTypedMock<Quiz[]>();
          case 'quizzes_with_email':
            return createTypedMock<Quiz[]>();
          default:
            return createTypedMock();
        }
      }),
    },
  };
});

describe('useTopicData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles missing parameters', async () => {
    // Render the hook with missing parameters
    const { result } = renderHook(() => useTopicData('', ''));

    // Wait for the hook to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that we have an error
    expect(result.current.error).toBe('Missing subject or topic parameters');
    expect(result.current.subjectData).toBeNull();
    expect(result.current.topicData).toBeNull();
    expect(result.current.chapterData).toBeNull();
  });

  it('handles subject not found', async () => {
    // Configure the mock to return a subject error
    (supabase.from as jest.Mock).mockImplementationOnce(() => {
      return createTypedMock<Subject>({
        data: null,
        error: { message: 'Subject not found' },
      });
    });

    // Render the hook with valid parameters
    const { result } = renderHook(() => useTopicData('math', '123'));

    // Wait for the hook to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that we have the expected error
    expect(result.current.error).toBe(
      'Failed to load subject: Subject not found'
    );
    expect(result.current.subjectData).toBeNull();
    expect(result.current.topicData).toBeNull();
    expect(result.current.chapterData).toBeNull();
  });

  it('handles successful data loading', async () => {
    // Configure mocks for a successful data load
    const mockSubject: Subject = {
      id: '1',
      name: 'Mathematics',
      slug: 'math',
      icon: 'calculator',
      description: 'Learn math concepts',
      order_index: 1,
      category: 'STEM',
    };

    // Mock Chapter with required properties
    const mockChapter: Chapter = {
      id: 'chap1',
      title: 'Introduction to Algebra',
      form: 1,
      order_index: 1,
    };

    const mockTopic: Topic = {
      id: '123',
      title: 'Algebra',
      description: 'Learn algebra',
      difficulty_level: 2,
      time_estimate_minutes: 30,
      order_index: 1,
      chapters: [mockChapter],
    };

    const mockQuizzes: Quiz[] = [
      {
        id: 'quiz1',
        name: 'Algebra Quiz',
        created_by: 'user123',
        created_at: '2023-01-01',
        verified: true,
        topic_id: '123',
        email: 'test@example.com',
      },
    ];

    // Setup the mocks
    (supabase.from as jest.Mock)
      .mockImplementationOnce(() => {
        return createTypedMock<Subject>({
          data: mockSubject,
          error: null,
        });
      })
      .mockImplementationOnce(() => {
        return createTypedMock<typeof mockTopic>({
          data: mockTopic,
          error: null,
        });
      })
      .mockImplementationOnce(() => {
        return createTypedMock<Quiz[]>({
          data: mockQuizzes,
          error: null,
        });
      })
      .mockImplementationOnce(() => {
        return createTypedMock<Quiz[]>({
          data: mockQuizzes,
          error: null,
        });
      });

    // Render the hook
    const { result } = renderHook(() => useTopicData('math', '123'));

    // Wait for the hook to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check the results
    expect(result.current.error).toBeNull();
    expect(result.current.subjectData).toEqual(mockSubject);
    expect(result.current.topicData).toEqual(mockTopic);
    expect(result.current.chapterData).toEqual(mockTopic.chapters[0]);
    expect(result.current.quizzes).toEqual(mockQuizzes);
  });
});

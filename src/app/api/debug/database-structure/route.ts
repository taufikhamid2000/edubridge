/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API Route that inspects the database structure to help debug issues
 */
export async function GET() {
  try {
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      tables: {},
      relationships: {},
      errors: [],
    };

    // Check subjects table
    try {
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .limit(1);

      if (subjectsError) {
        results.errors.push({
          table: 'subjects',
          message: subjectsError.message,
        });
      } else {
        results.tables.subjects = {
          exists: true,
          columns:
            subjects && subjects.length > 0 ? Object.keys(subjects[0]) : [],
          sample: subjects,
        };
      }
    } catch (error) {
      results.errors.push({ table: 'subjects', message: 'Exception occurred' });
    }

    // Check topics table
    try {
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .limit(1);

      if (topicsError) {
        results.errors.push({ table: 'topics', message: topicsError.message });
      } else {
        results.tables.topics = {
          exists: true,
          columns: topics && topics.length > 0 ? Object.keys(topics[0]) : [],
          sample: topics,
        };
      }
    } catch (error) {
      results.errors.push({ table: 'topics', message: 'Exception occurred' });
    }

    // Check chapters table
    try {
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .limit(1);

      if (chaptersError) {
        results.errors.push({
          table: 'chapters',
          message: chaptersError.message,
        });
      } else {
        results.tables.chapters = {
          exists: true,
          columns:
            chapters && chapters.length > 0 ? Object.keys(chapters[0]) : [],
          sample: chapters,
        };
      }
    } catch (error) {
      results.errors.push({ table: 'chapters', message: 'Exception occurred' });
    }

    // Check quizzes table
    try {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .limit(1);

      if (quizzesError) {
        results.errors.push({
          table: 'quizzes',
          message: quizzesError.message,
        });
      } else {
        results.tables.quizzes = {
          exists: true,
          columns: quizzes && quizzes.length > 0 ? Object.keys(quizzes[0]) : [],
          sample: quizzes,
        };
      }
    } catch (error) {
      results.errors.push({ table: 'quizzes', message: 'Exception occurred' });
    }

    // Check if there are any relationships between subjects and chapters
    try {
      if (results.tables.subjects && results.tables.chapters) {
        const { data: subjectChapters, error: relationError } = await supabase
          .from('chapters')
          .select('id, subject_id')
          .limit(1);

        if (!relationError) {
          results.relationships.subjectsToChapters = {
            exists:
              subjectChapters &&
              subjectChapters.length > 0 &&
              'subject_id' in subjectChapters[0],
            sample: subjectChapters,
          };
        }
      }
    } catch (error) {
      results.errors.push({
        relationship: 'subjects-chapters',
        message: 'Exception occurred',
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to inspect database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

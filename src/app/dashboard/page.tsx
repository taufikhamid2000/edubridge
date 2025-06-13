import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import { User } from '@/types/users';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // Get the cookieStore asynchronously
  const cookieStore = await cookies();

  // Create server-side Supabase client with proper auth settings
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value ?? '';
        },
        set() {}, // Don't need to set cookies in server component
        remove() {}, // Don't need to remove cookies in server component
      },
    }
  );

  try {
    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      logger.error('Session error in dashboard:', sessionError);
      throw new Error('Authentication error. Please try signing in again.');
    }

    if (!session) {
      logger.info('No active session, redirecting to auth');
      redirect('/auth');
    }

    // Fetch data in parallel for better performance
    const [
      { data: subjectsData, error: subjectsError },
      { data: userData, error: userError },
    ] = await Promise.all([
      // Fetch subjects
      supabase
        .from('subjects')
        .select('*')
        .order('order_index', { ascending: true }),

      // Fetch user profile
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single(),
    ]);

    // Handle fetch errors
    if (subjectsError) {
      logger.error('Error fetching subjects:', subjectsError);
      throw new Error('Failed to load subjects. Please try again.');
    }

    // PGRST116 is "no rows returned" - expected for new users
    if (userError && userError.code !== 'PGRST116') {
      logger.error('Error fetching user profile:', userError);
      throw new Error('Failed to load user profile. Please try again.');
    }

    // Create a sorted copy of the subjects data
    const sortedSubjects = [...(subjectsData || [])].sort((a, b) => {
      const priorityA = a.category_priority ?? 999;
      const priorityB = b.category_priority ?? 999;
      return priorityA - priorityB;
    });

    // Extract unique categories
    const categories = [
      'all',
      ...new Set(sortedSubjects.map((s) => s.category || 'Uncategorized')),
    ];

    // Construct user data for client, ensuring we handle null values
    const user = {
      id: session.user.id,
      email: session.user.email || '',
      display_name: userData?.display_name || undefined, // Convert null to undefined
      streak: userData?.streak || 0,
      xp: userData?.xp || 0,
      level: userData?.level || 1,
      lastQuizDate:
        userData?.last_quiz_date || new Date().toISOString().split('T')[0],
    } satisfies User; // Type assertion to ensure we match User type

    return (
      <DashboardClient
        initialUser={user}
        initialSubjects={sortedSubjects}
        initialCategories={categories}
      />
    );
  } catch (error) {
    logger.error('Error in dashboard page:', error);
    throw error; // Let the error boundary handle it
  }
}

import { User } from '@/types/users';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import UserProfileClient from './UserProfileClient';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

async function getUserData(userId: string) {
  const cookieStore = await cookies();

  // Create server-side Supabase client with proper auth settings
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {}, // No need to set cookies in a server component
        remove: () => {},
      },
      auth: {
        persistSession: false, // Don't persist session in server component
        autoRefreshToken: false, // Disable auto refresh on server side
        detectSessionInUrl: false, // Disable session detection in URL on server side
      },
    }
  );

  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        school:schools(*)
      `
      )
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user:', error);
      return null;
    }

    return user as User;
  } catch (error) {
    logger.error('Error in getUserData:', error);
    return null;
  }
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { userId } = params;
  const user = await getUserData(userId);

  if (!user) {
    redirect('/404');
  }

  return <UserProfileClient user={user} />;
}

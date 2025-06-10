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
  // Use server-side Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {}, // We don't need to set cookies for this read operation
        remove: () => {},
      },
    }
  );

  console.log('Fetching user data for userId:', userId);
  try {
    // Try user_profiles first
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

    console.log('Supabase response:', { user, error });

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
  console.log('Profile page params:', params);
  const { userId } = params;
  console.log('Extracted userId:', userId);
  const user = await getUserData(userId);
  console.log('Retrieved user:', user);

  if (!user) {
    console.log('No user found, redirecting to 404');
    redirect('/404');
  }

  return <UserProfileClient user={user} />;
}

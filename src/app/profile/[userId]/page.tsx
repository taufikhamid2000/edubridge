'use client';

import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/users';
import { fetchUserProfileByIdAPI } from '@/services/profileService';
import UserProfileClient from './UserProfileClient';
import { redirect } from 'next/navigation';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = params;

  // Fetch user profile using React Query and API route
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ['profile', userId],
    queryFn: () => fetchUserProfileByIdAPI(userId),
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes cache
    retry: 2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300 dark:text-gray-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Error or no user found
  if (error || !user) {
    redirect('/404');
  }

  return <UserProfileClient user={user} />;
}

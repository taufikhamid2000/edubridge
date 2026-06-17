'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    };

    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Logging Out...</h1>
        <p>Please wait while we log you out.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

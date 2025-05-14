'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Log admin page access for monitoring/security
  useEffect(() => {
    setIsMounted(true);
    const logAdminAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          logger.log('Admin area accessed by user:', session.user.id);
        }
      } catch (error) {
        logger.error('Error logging admin access:', error);
      }
    };

    logAdminAccess();
  }, []);

  if (!isMounted) {
    return null;
  }

  return <div className="admin-layout">{children}</div>;
}

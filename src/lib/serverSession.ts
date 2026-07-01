import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Reads the Supabase session from request cookies (server-side only) and
 * returns the access token to forward as a Bearer token to MyQuiza.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  return session?.access_token ?? null;
}

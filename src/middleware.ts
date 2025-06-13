import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Initialize response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  try {
    // Get the session using server component helper
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if it's a protected route
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboardPage && !session) {
      // If accessing dashboard without auth, redirect to login
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    if (isAuthPage && session) {
      // If accessing auth page while logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    // Log the error and clear the session
    console.error('Middleware authentication error:', error);

    // On error, proceed to page but clear session
    response.cookies.set({
      name: 'sb-auth-token',
      value: '',
      maxAge: 0,
    });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|public/|api/).*)',
  ],
};

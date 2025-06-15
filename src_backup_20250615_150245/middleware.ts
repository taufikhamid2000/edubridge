import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { log } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  // Skip noise from the auth API itself and Next static files
  if (
    /^\/(?:auth|_next|favicon\.ico|\.well-known)/.test(request.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }
  // Create base response with strong cache control
  let response = NextResponse.next({
    headers: new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }),
  });

  // Create a Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = request.cookies.get(name);
          return cookie?.value ?? null;
        },
        set(name, value, options) {
          response = NextResponse.next({
            headers: new Headers(request.headers),
          });
          response.cookies.set({
            name,
            value,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            ...options,
          });
        },
        remove(name) {
          response = NextResponse.next({
            headers: new Headers(request.headers),
          });
          response.cookies.set({
            name,
            value: '',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true,
            maxAge: 0,
          });
        },
      },
      auth: {
        autoRefreshToken: true, // Re-enable for proper session management
        persistSession: true,
        detectSessionInUrl: false, // Keep disabled to prevent URL-based loops
      },
    }
  );
  try {
    // Get the session using server component helper
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession(); // Log only on explicit demand
    log('Auth state:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      sessionError: sessionError?.message,
    }); // Check if it's a protected route
    // const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
    // const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

    // If there's a session error, clear cookies and redirect to auth
    if (sessionError) {
      throw sessionError; // This will be caught by our catch block
    }

    // Disable automatic redirects to prevent loops
    // if (isDashboardPage && !session) {
    //   // If accessing dashboard without auth, redirect to login
    //   const redirectUrl = new URL('/auth', request.url);
    //   redirectUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    //   return NextResponse.redirect(redirectUrl);
    // }

    // if (isAuthPage && session) {
    //   // If accessing auth page while logged in, redirect to dashboard
    //   // Check if there's a return URL to redirect back to
    //   const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    //   const redirectUrl = new URL(returnUrl || '/dashboard', request.url);
    //   return NextResponse.redirect(redirectUrl);
    // }

    return response;
  } catch (error) {
    // Log the error and clear all auth-related cookies
    console.error('Middleware authentication error:', error);

    // Clear all Supabase auth cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token',
    ];
    cookiesToClear.forEach((name) => {
      response.cookies.set({
        name,
        value: '',
        maxAge: 0,
        path: '/',
      });
    });

    // On protected routes, redirect to auth and ensure the redirect is not cached
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
    if (isDashboardPage) {
      const redirectUrl = new URL('/auth', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Copy cleared cookies to redirect response
      cookiesToClear.forEach((name) => {
        redirectResponse.cookies.set({
          name,
          value: '',
          maxAge: 0,
          path: '/',
        });
      });

      // Add cache control headers to prevent caching
      redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0');
      return redirectResponse;
    }

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match only dashboard and protected routes, exclude:
     * - auth routes (prevent loops)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known routes (Chrome DevTools and other well-known endpoints)
     * - api routes
     */
    '/((?!auth|_next|favicon.ico|\\.well-known|api).*)',
  ],
};

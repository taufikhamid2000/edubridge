import { NextResponse } from 'next/server';

// Handle Chrome DevTools requests to prevent 404s in logs
export async function GET() {
  return NextResponse.json(
    {
      // Empty response - Chrome DevTools will handle gracefully
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    }
  );
}

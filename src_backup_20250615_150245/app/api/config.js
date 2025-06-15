// This is a route segment config file for the API section
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

// Mark all API routes as dynamic to avoid pre-rendering them during build
export const dynamic = 'force-dynamic';

// Don't generate static params for dynamic routes
export const dynamicParams = true;

// API responses should not be cached
export const revalidate = 0;

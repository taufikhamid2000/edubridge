// This file acts as a catch-all for admin routes to prevent pre-rendering

// Route segment config for dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0; // Always revalidate

// The catch-all route component
export default function AdminPage() {
  // This page will never be rendered - it just makes Next.js
  // recognize all admin routes as dynamic to optimize build time
  return null;
}

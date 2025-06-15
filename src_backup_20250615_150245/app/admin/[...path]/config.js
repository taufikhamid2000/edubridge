// filepath: d:\Projects\edubridge\src\app\RouteGroupConfig.js
// This file centralizes Next.js route configuration to optimize builds

/**
 * This marks admin pages as dynamic to avoid building them during static generation
 * Create a similar file in each admin subfolder with the same content
 * and import nothing ('import "./config";') to make it take effect
 */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 60; // cache for 1 minute

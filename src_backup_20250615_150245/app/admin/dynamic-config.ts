'use server';

// This file centralizes the dynamic route configuration
// Any file that imports this will be set to dynamic rendering
// rather than being built during the static build phase

// Setting these values will skip pre-rendering these pages during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// This helps with better caching
export const revalidate = 60; // revalidate at most every minute

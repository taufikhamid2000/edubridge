// This configures the admin section to be dynamically rendered
// rather than built at build time, reducing unnecessary pages

// Setting these values will skip pre-rendering these pages during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Don't use any caching for admin routes since data changes frequently
export const revalidate = 0; // no caching

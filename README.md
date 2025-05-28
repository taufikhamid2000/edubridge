# EduBridge

EduBridge is an educational platform built with Next.js and Supabase, designed to provide structured learning experiences with gamification elements to increase engagement.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Supabase account

### Environment Setup

1. Copy `.env.example` to a new file named `.env.local`
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key for admin operations (required for admin features)

For detailed environment setup instructions, see [Environment Setup Guide](./docs/environment-setup.md).

### Development Server

```bash
npm install
npm run dev
```

### Database Migrations

For database schema changes, we use Supabase migrations. Apply them as follows:

```bash
# Using Supabase CLI
supabase migration up

# Or use our script
./scripts/apply_quiz_attempts_migration.sh
```

To fix the "quiz_attempts table not found" error, see the [Quiz Attempts Migration Guide](./docs/database/apply_quiz_attempts_migration.md).

For more details about database schema and management, see the [Database Documentation](./docs/database/).
npm run dev

````

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Documentation

### Core Documentation

- [Project Overview](./docs/project-overview.md) - Architecture, data flow, and design decisions
- [Development Guide](./docs/development-guide.md) - Workflow, best practices, and troubleshooting
- [API Documentation](./docs/api-documentation.md) - API endpoints and usage
- [Environment Setup](./docs/environment-setup.md) - Setting up the environment
- [Component Design System](./docs/component-design-system.md) - UI component architecture
- [Authentication System](./docs/authentication-system.md) - Auth implementation details
- [Testing Strategy](./docs/testing-strategy.md) - Testing approach and practices
- [Performance Optimization](./docs/performance-optimization.md) - Performance best practices
- [Database Schema Reference](./database-schema-reference.md) - Database structure

### Feature Documentation

- [Admin Panel Documentation](./docs/admin-panel.md) - Admin features and functionality
- [Admin Role Fix Guide](./docs/admin-role-fix.md) - Fixing admin role issues
- [Leaderboard Feature](./docs/leaderboard-feature.md) - Leaderboard implementation details

## 🧪 Testing

This project uses Jest and React Testing Library for testing components, hooks, utilities, and services. To run the tests:

```bash
npm test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
````

Tests are organized in the following structure:

- `src/__tests__/components/` - Component tests
- `src/__tests__/hooks/` - Hook tests
- `src/__tests__/lib/` - Utility function tests
- `src/__tests__/services/` - Service function tests

When adding new features, please add corresponding tests.

## Production Security

For production deployments, we've implemented several security measures:

- Removed all debugging endpoints and tools
- Implemented proper error logging through the logger service
- Added secure authentication validation for admin functions
- Applied the principle of least privilege for all database operations

See [Security Considerations](./docs/admin-panel.md#security-considerations) in the admin documentation for more details.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    // scripts/ holds one-off CLI/maintenance scripts, not app code — console
    // output there is the point, and they were never linted before eslint 16
    // started including them by default.
    ignores: ['**/__tests__/**/*', '**/coverage/**/*', 'scripts/**/*'],
  },
  {
    // Route all logging through the logger wrapper (dev/prod gating + error
    // sanitization). Raw console.* is disallowed in app code.
    rules: {
      'no-console': 'error',
    },
  },
  {
    // The logger wrapper and the console override are the one place console.*
    // is intentional.
    files: ['src/lib/logger.ts', 'src/lib/console-override.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // eslint-config-next 16 bundles a rewritten eslint-plugin-react-hooks
    // with new React Compiler-oriented rules that surface ~100 pre-existing
    // patterns across the app (setState-in-effect, immutability, etc.).
    // Real findings, but fixing them is a separate effort from the dependency
    // bump — downgraded to warn so they stay visible without blocking CI.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
];

export default eslintConfig;

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['**/__tests__/**/*', '**/coverage/**/*'],
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
];

export default eslintConfig;

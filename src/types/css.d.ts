// TypeScript 6+ no longer silently allows unresolved side-effect-only imports.
// Next.js's own ambient types (next/types/global.d.ts) only declare
// `*.module.css` (CSS Modules) — plain side-effect `.css` imports (e.g. in
// src/app/layout.tsx) need this declaration or the type checker fails with
// "Cannot find module or type declarations for side-effect import".
declare module '*.css';

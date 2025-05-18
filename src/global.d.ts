// This file contains global type definitions for test files
import '@testing-library/jest-dom';


declare global {
  // Directly declare the matchers to make TypeScript happy
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toHaveFocus(): R;
    }
  }

  // Expose Jest methods as globals for TypeScript
  const jest: (typeof import('@jest/globals'))['jest'];
  const describe: (typeof import('@jest/globals'))['describe'];
  const it: (typeof import('@jest/globals'))['it'];
  const test: (typeof import('@jest/globals'))['test'];
  const expect: (typeof import('@jest/globals'))['expect'];
  const beforeAll: (typeof import('@jest/globals'))['beforeAll'];
  const afterAll: (typeof import('@jest/globals'))['afterAll'];
  const beforeEach: (typeof import('@jest/globals'))['beforeEach'];
  const afterEach: (typeof import('@jest/globals'))['afterEach'];
}

// This export is needed to make this file a module
export {};

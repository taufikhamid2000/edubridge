// jest-dom.d.ts
import '@testing-library/jest-dom';

// Extend the Jest matchers with Testing Library's custom matchers
declare global {
  namespace jest {
    // Redefining matchers to work with TypeScript
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
}

// This export is needed to make this file a module
export {};

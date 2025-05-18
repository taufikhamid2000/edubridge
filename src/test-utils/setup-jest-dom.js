// This file extends Jest's expect function with jest-dom matchers
import { expect } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';

// Add all jest-dom matchers
expect.extend(matchers);

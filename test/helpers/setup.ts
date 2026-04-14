import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// window.matchMedia mock — required for jsdom which doesn't implement it
// ---------------------------------------------------------------------------

let _reducedMotionMatches = false;

export function setReducedMotionMock(value: boolean): void {
  _reducedMotionMatches = value;
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === '(prefers-reduced-motion: reduce)'
          ? _reducedMotionMatches
          : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

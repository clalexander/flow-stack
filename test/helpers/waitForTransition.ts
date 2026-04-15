import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Advance fake timers by the given duration (default 300ms covers all presets)
 * and flush all pending React updates.
 */
export async function waitForTransition(ms = 300): Promise<void> {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

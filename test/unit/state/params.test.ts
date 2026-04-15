import { describe, it, expect } from 'vitest';

import { mergeNavigationParams } from '../../../src/state/params';

describe('mergeNavigationParams', () => {
  it('returns a new object with current and next params merged', () => {
    const current = { a: 1, b: 2 };
    const next = { b: 99, c: 3 };
    expect(mergeNavigationParams(current, next)).toEqual({ a: 1, b: 99, c: 3 });
  });

  it('does not mutate the original params', () => {
    const current = { a: 1 };
    const next = { a: 2 };
    mergeNavigationParams(current, next);
    expect(current.a).toBe(1);
  });

  it('next overrides current for shared keys', () => {
    const result = mergeNavigationParams({ x: 'old' }, { x: 'new' });
    expect(result.x).toBe('new');
  });

  it('keeps current keys not present in next', () => {
    const result = mergeNavigationParams({ a: 1, b: 2 }, { b: 3 });
    expect(result.a).toBe(1);
  });

  it('accepts an empty next object', () => {
    const current = { a: 1 };
    expect(mergeNavigationParams(current, {})).toEqual({ a: 1 });
  });
});

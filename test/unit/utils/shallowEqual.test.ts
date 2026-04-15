import { describe, it, expect } from 'vitest';

import { shallowEqual } from '../../../src/utils/shallowEqual';

describe('shallowEqual', () => {
  it('returns true for the same reference', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('returns true for objects with identical primitive values', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });

  it('returns false when a value differs', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false when key counts differ', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when nested objects differ by reference', () => {
    expect(shallowEqual({ a: {} }, { a: {} })).toBe(false);
  });

  it('returns true for same nested object reference', () => {
    const inner = {};
    expect(shallowEqual({ a: inner }, { a: inner })).toBe(true);
  });

  it('returns false when a is null and b is an object', () => {
    expect(shallowEqual(null, { a: 1 })).toBe(false);
  });

  it('returns false when b is null and a is an object', () => {
    expect(shallowEqual({ a: 1 }, null)).toBe(false);
  });

  it('returns true for two empty objects', () => {
    expect(shallowEqual({}, {})).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';

import {
  isNavigationEntryMatcher,
  isNavigationTransitionSpec,
  isNavigationAction,
} from '../../../src/utils/is';

describe('isNavigationEntryMatcher', () => {
  it('returns true for routeName matcher', () => {
    expect(isNavigationEntryMatcher({ type: 'routeName', value: 'Home' })).toBe(
      true,
    );
  });

  it('returns true for entryKey matcher', () => {
    expect(isNavigationEntryMatcher({ type: 'entryKey', value: 'k1' })).toBe(
      true,
    );
  });

  it('returns true for id matcher', () => {
    expect(isNavigationEntryMatcher({ type: 'id', value: 'id-1' })).toBe(true);
  });

  it('returns true for predicate matcher', () => {
    expect(
      isNavigationEntryMatcher({ type: 'predicate', value: () => true }),
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNavigationEntryMatcher(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNavigationEntryMatcher(undefined)).toBe(false);
  });

  it('returns false for unknown type', () => {
    expect(isNavigationEntryMatcher({ type: 'unknown', value: 'x' })).toBe(
      false,
    );
  });

  it('returns false for primitive', () => {
    expect(isNavigationEntryMatcher('routeName')).toBe(false);
  });
});

describe('isNavigationTransitionSpec', () => {
  it('returns true for a spec object', () => {
    expect(isNavigationTransitionSpec({ duration: 200 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNavigationTransitionSpec(null)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isNavigationTransitionSpec('fade')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNavigationTransitionSpec(undefined)).toBe(false);
  });
});

describe('isNavigationAction', () => {
  it('returns true for a push action', () => {
    expect(isNavigationAction({ type: 'push', route: 'Home' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isNavigationAction(null)).toBe(false);
  });

  it('returns false for object without type', () => {
    expect(isNavigationAction({ route: 'Home' })).toBe(false);
  });

  it('returns false for primitive', () => {
    expect(isNavigationAction('push')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';

import {
  matchesNavigationEntry,
  findNavigationEntry,
} from '../../../src/state/matchers';
import { makeEntry } from '../../fixtures/entries';

describe('matchesNavigationEntry', () => {
  const entries = [
    makeEntry({ routeName: 'Home', key: 'key-home' }),
    makeEntry({ routeName: 'Detail', key: 'key-detail', id: 'detail-1' }),
  ];

  describe('routeName matcher', () => {
    it('matches when routeNames are equal', () => {
      expect(
        matchesNavigationEntry(
          { type: 'routeName', value: 'Home' },
          entries[0],
          0,
          entries,
        ),
      ).toBe(true);
    });

    it('does not match when routeNames differ', () => {
      expect(
        matchesNavigationEntry(
          { type: 'routeName', value: 'Settings' },
          entries[0],
          0,
          entries,
        ),
      ).toBe(false);
    });
  });

  describe('entryKey matcher', () => {
    it('matches when keys are equal', () => {
      expect(
        matchesNavigationEntry(
          { type: 'entryKey', value: 'key-detail' },
          entries[1],
          1,
          entries,
        ),
      ).toBe(true);
    });

    it('does not match on wrong key', () => {
      expect(
        matchesNavigationEntry(
          { type: 'entryKey', value: 'key-home' },
          entries[1],
          1,
          entries,
        ),
      ).toBe(false);
    });
  });

  describe('id matcher', () => {
    it('matches when ids are equal', () => {
      expect(
        matchesNavigationEntry(
          { type: 'id', value: 'detail-1' },
          entries[1],
          1,
          entries,
        ),
      ).toBe(true);
    });

    it('does not match when id differs', () => {
      expect(
        matchesNavigationEntry(
          { type: 'id', value: 'other' },
          entries[1],
          1,
          entries,
        ),
      ).toBe(false);
    });
  });

  describe('predicate matcher', () => {
    it('delegates to the predicate function', () => {
      expect(
        matchesNavigationEntry(
          { type: 'predicate', value: (e) => e.routeName === 'Detail' },
          entries[1],
          1,
          entries,
        ),
      ).toBe(true);
    });

    it('passes index and entries to the predicate', () => {
      let capturedIndex = -1;
      let capturedEntries: typeof entries | null = null;
      matchesNavigationEntry(
        {
          type: 'predicate',
          value: (_, i, es) => {
            capturedIndex = i;
            capturedEntries = es as typeof entries;
            return false;
          },
        },
        entries[0],
        0,
        entries,
      );
      expect(capturedIndex).toBe(0);
      expect(capturedEntries).toBe(entries);
    });
  });
});

describe('findNavigationEntry', () => {
  const entries = [
    makeEntry({ routeName: 'Home', key: 'k1' }),
    makeEntry({ routeName: 'Detail', key: 'k2' }),
    makeEntry({ routeName: 'Settings', key: 'k3' }),
  ];

  it('returns the first matching entry', () => {
    const result = findNavigationEntry(entries, {
      type: 'routeName',
      value: 'Detail',
    });
    expect(result).toBe(entries[1]);
  });

  it('returns null when no entry matches', () => {
    const result = findNavigationEntry(entries, {
      type: 'routeName',
      value: 'Unknown',
    });
    expect(result).toBeNull();
  });
});

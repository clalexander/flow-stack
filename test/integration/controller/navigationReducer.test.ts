import { describe, it, expect } from 'vitest';

import { navigationReducer } from '../../../src/controller/navigationReducer';
import { makeEntry, activeStackState } from '../../fixtures/entries';

function state2() {
  return activeStackState([
    makeEntry({ routeName: 'Home', key: 'k-home' }),
    makeEntry({ routeName: 'Detail', key: 'k-detail' }),
  ]);
}

describe('navigationReducer', () => {
  describe('push', () => {
    it('appends a new entry', () => {
      const next = navigationReducer(state2(), {
        type: 'push',
        route: 'Settings',
      });
      expect(next.entries).toHaveLength(3);
      expect(next.entries[2].routeName).toBe('Settings');
    });

    it('advances activeIndex to the new entry', () => {
      const next = navigationReducer(state2(), {
        type: 'push',
        route: 'Settings',
      });
      expect(next.activeIndex).toBe(2);
    });

    it('records lastAction', () => {
      const action = { type: 'push' as const, route: 'Settings' };
      const next = navigationReducer(state2(), action);
      expect(next.lastAction).toBe(action);
    });

    it('does not mutate the original state', () => {
      const original = state2();
      navigationReducer(original, { type: 'push', route: 'Settings' });
      expect(original.entries).toHaveLength(2);
    });
  });

  describe('replace', () => {
    it('replaces the active entry', () => {
      const next = navigationReducer(state2(), {
        type: 'replace',
        route: 'Settings',
      });
      expect(next.entries).toHaveLength(2);
      expect(next.entries[1].routeName).toBe('Settings');
    });

    it('keeps the same key for the replaced entry', () => {
      const s = state2();
      const originalKey = s.entries[1].key;
      const next = navigationReducer(s, { type: 'replace', route: 'Settings' });
      expect(next.entries[1].key).toBe(originalKey);
    });

    it('handles replace on empty stack', () => {
      const empty = activeStackState([], -1);
      const next = navigationReducer(empty, { type: 'replace', route: 'Home' });
      expect(next.entries).toHaveLength(1);
      expect(next.entries[0].routeName).toBe('Home');
    });
  });

  describe('pop', () => {
    it('removes the top entry', () => {
      const next = navigationReducer(state2(), { type: 'pop' });
      expect(next.entries).toHaveLength(1);
      expect(next.entries[0].routeName).toBe('Home');
    });

    it('decrements activeIndex', () => {
      const next = navigationReducer(state2(), { type: 'pop' });
      expect(next.activeIndex).toBe(0);
    });

    it('does nothing when only one entry', () => {
      const single = activeStackState([makeEntry({ routeName: 'Home' })]);
      const next = navigationReducer(single, { type: 'pop' });
      expect(next).toBe(single);
    });

    it('pops multiple entries with count parameter', () => {
      const s = activeStackState([
        makeEntry({ routeName: 'A' }),
        makeEntry({ routeName: 'B' }),
        makeEntry({ routeName: 'C' }),
      ]);
      const next = navigationReducer(s, { type: 'pop', count: 2 });
      expect(next.entries).toHaveLength(1);
      expect(next.entries[0].routeName).toBe('A');
    });
  });

  describe('popToRoot', () => {
    it('keeps only the first entry', () => {
      const s = activeStackState([
        makeEntry({ routeName: 'Home' }),
        makeEntry({ routeName: 'A' }),
        makeEntry({ routeName: 'B' }),
      ]);
      const next = navigationReducer(s, { type: 'popToRoot' });
      expect(next.entries).toHaveLength(1);
      expect(next.entries[0].routeName).toBe('Home');
      expect(next.activeIndex).toBe(0);
    });

    it('is a no-op when already at root', () => {
      const single = activeStackState([makeEntry({ routeName: 'Home' })]);
      expect(navigationReducer(single, { type: 'popToRoot' })).toBe(single);
    });
  });

  describe('popTo', () => {
    it('pops to the matched entry', () => {
      const entries = [
        makeEntry({ routeName: 'Home', key: 'k0' }),
        makeEntry({ routeName: 'A', key: 'k1' }),
        makeEntry({ routeName: 'B', key: 'k2' }),
      ];
      const s = activeStackState(entries);
      const next = navigationReducer(s, {
        type: 'popTo',
        matcher: { type: 'routeName', value: 'A' },
      });
      expect(next.entries).toHaveLength(2);
      expect(next.activeIndex).toBe(1);
    });

    it('returns unchanged state when matcher has no match', () => {
      const s = state2();
      const next = navigationReducer(s, {
        type: 'popTo',
        matcher: { type: 'routeName', value: 'Unknown' },
      });
      expect(next).toBe(s);
    });
  });

  describe('reset', () => {
    it('replaces all entries', () => {
      const next = navigationReducer(state2(), {
        type: 'reset',
        entries: [{ name: 'X' }, { name: 'Y' }],
      });
      expect(next.entries).toHaveLength(2);
      expect(next.entries[0].routeName).toBe('X');
      expect(next.entries[1].routeName).toBe('Y');
    });

    it('sets activeIndex to last entry', () => {
      const next = navigationReducer(state2(), {
        type: 'reset',
        entries: [{ name: 'A' }, { name: 'B' }],
      });
      expect(next.activeIndex).toBe(1);
    });
  });

  describe('setParams', () => {
    it('merges params into the active entry', () => {
      const s = activeStackState([
        makeEntry({ routeName: 'Home', params: { a: 1 } }),
      ]);
      const next = navigationReducer(s, {
        type: 'setParams',
        params: { a: 99, b: 2 },
      });
      expect(next.entries[0].params).toEqual({ a: 99, b: 2 });
    });

    it('is a no-op when no active entry', () => {
      const empty = activeStackState([], -1);
      const next = navigationReducer(empty, {
        type: 'setParams',
        params: { x: 1 },
      });
      expect(next).toBe(empty);
    });
  });

  describe('updateEntry', () => {
    it('applies the updater to the matching entry', () => {
      const s = state2();
      const key = s.entries[0].key;
      const next = navigationReducer(s, {
        type: 'updateEntry',
        entryKey: key,
        updater: (e) => ({ ...e, params: { updated: true } }),
      });
      expect(next.entries[0].params).toEqual({ updated: true });
    });

    it('returns unchanged state when key not found', () => {
      const s = state2();
      const next = navigationReducer(s, {
        type: 'updateEntry',
        entryKey: 'no-such-key',
        updater: (e) => e,
      });
      expect(next).toBe(s);
    });
  });

  describe('preload', () => {
    it('does not change entries', () => {
      const s = state2();
      const next = navigationReducer(s, { type: 'preload', route: 'Settings' });
      expect(next.entries).toHaveLength(2);
    });

    it('records lastAction', () => {
      const action = { type: 'preload' as const, route: 'Settings' };
      const next = navigationReducer(state2(), action);
      expect(next.lastAction).toBe(action);
    });
  });

  describe('entry state normalization', () => {
    it('active entry has state "active" after push', () => {
      const next = navigationReducer(state2(), { type: 'push', route: 'X' });
      expect(next.entries[next.activeIndex].state).toBe('active');
    });

    it('previous entries have state "inactive" after push', () => {
      const next = navigationReducer(state2(), { type: 'push', route: 'X' });
      // entries[0] (Home) was already inactive before push; normalizeEntries preserves it
      expect(next.entries[0].state).toBe('inactive');
      // entries[1] (Detail) was the active entry; normalizeEntries(state.entries, state.activeIndex=1)
      // keeps it 'active' so it remains visible during the outgoing transition
      expect(next.entries[1].state).toBe('active');
    });
  });
});

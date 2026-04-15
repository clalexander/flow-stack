import { describe, it, expect } from 'vitest';

import {
  getActiveEntry,
  getStackDepth,
  canPop,
  createEntriesFromInputs,
} from '../../../src/state/history';
import { makeEntry, activeStackState } from '../../fixtures/entries';

describe('getActiveEntry', () => {
  it('returns the entry at activeIndex', () => {
    const e0 = makeEntry({ routeName: 'Home' });
    const e1 = makeEntry({ routeName: 'Detail' });
    const state = activeStackState([e0, e1], 1);
    expect(getActiveEntry(state)).toStrictEqual({ ...e1, state: 'active' });
  });

  it('returns null when entries is empty', () => {
    const state = activeStackState([], -1);
    expect(getActiveEntry(state)).toBeNull();
  });
});

describe('getStackDepth', () => {
  it('returns the number of entries', () => {
    const state = activeStackState([makeEntry(), makeEntry(), makeEntry()]);
    expect(getStackDepth(state)).toBe(3);
  });

  it('returns 0 for empty stack', () => {
    expect(getStackDepth(activeStackState([], -1))).toBe(0);
  });
});

describe('canPop', () => {
  it('returns true when more than one entry and activeIndex > 0', () => {
    const state = activeStackState([makeEntry(), makeEntry()], 1);
    expect(canPop(state)).toBe(true);
  });

  it('returns false when only one entry', () => {
    const state = activeStackState([makeEntry()], 0);
    expect(canPop(state)).toBe(false);
  });

  it('returns false when activeIndex is 0', () => {
    const state = activeStackState([makeEntry(), makeEntry()], 0);
    expect(canPop(state)).toBe(false);
  });
});

describe('createEntriesFromInputs', () => {
  it('maps inputs to entries with correct routeNames and params', () => {
    const inputs = [
      { name: 'Home', params: { a: 1 } },
      { name: 'Detail', params: { b: 2 } },
    ];
    const entries = createEntriesFromInputs(inputs);
    expect(entries).toHaveLength(2);
    expect(entries[0].routeName).toBe('Home');
    expect(entries[0].params).toEqual({ a: 1 });
    expect(entries[1].routeName).toBe('Detail');
  });

  it('sets last entry state to active, others to inactive', () => {
    const inputs = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
    const entries = createEntriesFromInputs(inputs);
    expect(entries[0].state).toBe('inactive');
    expect(entries[1].state).toBe('inactive');
    expect(entries[2].state).toBe('active');
  });

  it('uses empty object when params is omitted', () => {
    const entries = createEntriesFromInputs([{ name: 'Home' }]);
    expect(entries[0].params).toEqual({});
  });

  it('assigns a unique non-empty key to each entry', () => {
    const entries = createEntriesFromInputs([{ name: 'A' }, { name: 'B' }]);
    expect(entries[0].key).toBeTruthy();
    expect(entries[1].key).toBeTruthy();
    expect(entries[0].key).not.toBe(entries[1].key);
  });
});

import { describe, it, expect, vi } from 'vitest';

import { resolveRouteKey } from '../../../src/routes/resolveRouteKey';
import { makeEntry } from '../../fixtures/entries';

const base = {
  stackId: 'test-stack',
  routeName: 'Home',
  params: {},
  existingEntries: [],
};

describe('resolveRouteKey', () => {
  describe('default resolver', () => {
    it('includes the routeName in the key when no id', () => {
      const key = resolveRouteKey(base);
      expect(key).toMatch(/^Home:/);
    });

    it('includes the id in the key when id is provided', () => {
      const key = resolveRouteKey({ ...base, id: 'profile-1' });
      expect(key).toMatch(/^profile-1:/);
    });

    it('counts duplicate routeNames in existing entries', () => {
      const existing = [
        makeEntry({ routeName: 'Home' }),
        makeEntry({ routeName: 'Home' }),
      ];
      const key = resolveRouteKey({ ...base, existingEntries: existing });
      // duplicate count = 2
      expect(key).toMatch(/^Home:2:/);
    });

    it('counts duplicate ids in existing entries', () => {
      const existing = [makeEntry({ id: 'profile-5', routeName: 'Profile' })];
      const key = resolveRouteKey({
        ...base,
        routeName: 'Profile',
        id: 'profile-5',
        existingEntries: existing,
      });
      expect(key).toMatch(/^profile-5:1:/);
    });

    it('count is 0 for first occurrence', () => {
      const key = resolveRouteKey(base);
      expect(key).toMatch(/^Home:0:/);
    });
  });

  describe('custom routeKeyResolver', () => {
    it('calls the resolver with the correct args and returns its result', () => {
      const resolver = vi.fn().mockReturnValue('custom-key');
      const key = resolveRouteKey({ ...base, routeKeyResolver: resolver });
      expect(resolver).toHaveBeenCalledWith({
        stackId: 'test-stack',
        routeName: 'Home',
        params: {},
        existingEntries: [],
        id: undefined,
      });
      expect(key).toBe('custom-key');
    });
  });
});

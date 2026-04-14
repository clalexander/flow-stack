import { describe, it, expect } from 'vitest';

import { createNavigationStackController } from '../../../src/controller/createNavigationStackController';
import { simpleRegistry } from '../../fixtures/routes';

function makeController() {
  return createNavigationStackController({
    id: 'test',
    routes: simpleRegistry,
    initialRoute: { name: 'Home' },
  });
}

describe('createNavigationStackController', () => {
  describe('initialization', () => {
    it('starts with the initial route', () => {
      const c = makeController();
      expect(c.entries).toHaveLength(1);
      expect(c.entries[0].routeName).toBe('Home');
    });

    it('activeIndex is 0', () => {
      const c = makeController();
      expect(c.state.activeIndex).toBe(0);
    });

    it('exposes stackId', () => {
      const c = makeController();
      expect(c.stackId).toBe('test');
    });

    it('depth is 1', () => {
      const c = makeController();
      expect(c.depth).toBe(1);
    });

    it('canGoBack is false', () => {
      const c = makeController();
      expect(c.canGoBack).toBe(false);
    });

    it('activeEntry is the initial entry', () => {
      const c = makeController();
      expect(c.activeEntry?.routeName).toBe('Home');
    });
  });

  describe('push', () => {
    it('adds a new entry and advances activeIndex', () => {
      const c = makeController();
      c.push('Detail');
      expect(c.entries).toHaveLength(2);
      expect(c.entries[1].routeName).toBe('Detail');
      expect(c.state.activeIndex).toBe(1);
    });

    it('canGoBack becomes true after push', () => {
      const c = makeController();
      c.push('Detail');
      expect(c.canGoBack).toBe(true);
    });

    it('sets params on the pushed entry', () => {
      const c = createNavigationStackController({
        id: 'test',
        routes: simpleRegistry,
        initialRoute: { name: 'Home' },
      });
      c.push('Detail', { id: 7 });
      expect(c.activeEntry?.params).toEqual({ id: 7 });
    });

    it('throws for an unknown route', () => {
      const c = makeController();
      expect(() => c.push('Unknown')).toThrow('Unknown route');
    });
  });

  describe('replace', () => {
    it('replaces the active entry', () => {
      const c = makeController();
      c.replace('Detail');
      expect(c.entries).toHaveLength(1);
      expect(c.entries[0].routeName).toBe('Detail');
    });

    it('does not increase depth', () => {
      const c = makeController();
      c.replace('Detail');
      expect(c.depth).toBe(1);
    });
  });

  describe('pop', () => {
    it('removes the top entry', () => {
      const c = makeController();
      c.push('Detail');
      c.pop();
      expect(c.entries).toHaveLength(1);
      expect(c.activeEntry?.routeName).toBe('Home');
    });

    it('is a no-op at root', () => {
      const c = makeController();
      c.pop();
      expect(c.depth).toBe(1);
    });
  });

  describe('popToRoot', () => {
    it('collapses to the root entry', () => {
      const c = makeController();
      c.push('Detail');
      c.push('Settings');
      c.popToRoot();
      expect(c.entries).toHaveLength(1);
      expect(c.activeEntry?.routeName).toBe('Home');
    });
  });

  describe('popTo', () => {
    it('pops to the matched entry by routeName', () => {
      const c = makeController();
      c.push('Detail');
      c.push('Settings');
      c.popTo({ type: 'routeName', value: 'Detail' });
      expect(c.entries).toHaveLength(2);
      expect(c.activeEntry?.routeName).toBe('Detail');
    });

    it('does nothing when matcher has no match', () => {
      const c = makeController();
      c.push('Detail');
      c.popTo({ type: 'routeName', value: 'Unknown' });
      expect(c.depth).toBe(2);
    });
  });

  describe('setParams', () => {
    it('merges params into the active entry', () => {
      const c = makeController();
      c.setParams({ x: 42 });
      expect(c.activeEntry?.params).toMatchObject({ x: 42 });
    });
  });

  describe('updateEntry', () => {
    it('applies the updater to the target entry', () => {
      const c = makeController();
      const key = c.activeEntry!.key;
      c.updateEntry(key, (e) => ({ ...e, params: { updated: true } }));
      expect(c.activeEntry?.params).toEqual({ updated: true });
    });
  });

  describe('reset', () => {
    it('replaces all entries', () => {
      const c = makeController();
      c.push('Detail');
      c.reset([{ name: 'Settings' }]);
      expect(c.entries).toHaveLength(1);
      expect(c.activeEntry?.routeName).toBe('Settings');
    });
  });

  describe('preload', () => {
    it('does not add entries', () => {
      const c = makeController();
      c.preload('Detail');
      expect(c.depth).toBe(1);
    });

    it('records lastAction as preload', () => {
      const c = makeController();
      c.preload('Detail');
      expect(c.state.lastAction?.type).toBe('preload');
    });
  });

  describe('getEntry', () => {
    it('returns the matching entry', () => {
      const c = makeController();
      c.push('Detail');
      const entry = c.getEntry({ type: 'routeName', value: 'Detail' });
      expect(entry?.routeName).toBe('Detail');
    });

    it('returns null when not found', () => {
      const c = makeController();
      expect(c.getEntry({ type: 'routeName', value: 'Unknown' })).toBeNull();
    });
  });
});

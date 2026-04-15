import { describe, it, expect } from 'vitest';

import { normalizeRouteRegistry } from '../../../src/routes/normalizeRouteRegistry';
import { simpleRegistry } from '../../fixtures/routes';

describe('normalizeRouteRegistry', () => {
  describe('array input', () => {
    it('converts array to a record keyed by route name', () => {
      const result = normalizeRouteRegistry(simpleRegistry);
      expect(Object.keys(result)).toEqual(['Home', 'Detail', 'Settings']);
    });

    it('each value is the original route definition', () => {
      const result = normalizeRouteRegistry(simpleRegistry);
      expect(result['Home']).toBe(simpleRegistry[0]);
      expect(result['Detail']).toBe(simpleRegistry[1]);
    });

    it('last definition wins on duplicate names', () => {
      const dup = [
        { name: 'Home', component: () => null },
        { name: 'Home', component: () => null },
      ] as const;
      const result = normalizeRouteRegistry(
        dup as unknown as typeof simpleRegistry,
      );
      expect(result['Home']).toBe(dup[1]);
    });

    it('empty array produces empty registry', () => {
      const result = normalizeRouteRegistry([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('object input', () => {
    it('clones the object into a normalized registry', () => {
      const obj = {
        Home: simpleRegistry[0],
        Detail: simpleRegistry[1],
      };
      const result = normalizeRouteRegistry(obj);
      expect(result['Home']).toBe(obj.Home);
      expect(result['Detail']).toBe(obj.Detail);
    });

    it('returns the same keys as the input object', () => {
      const obj = { Settings: simpleRegistry[2] };
      const result = normalizeRouteRegistry(obj);
      expect(Object.keys(result)).toEqual(['Settings']);
    });
  });
});

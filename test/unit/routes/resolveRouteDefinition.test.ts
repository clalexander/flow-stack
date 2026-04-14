import { describe, it, expect } from 'vitest';

import { normalizeRouteRegistry } from '../../../src/routes/normalizeRouteRegistry';
import { resolveRouteDefinition } from '../../../src/routes/resolveRouteDefinition';
import { simpleRegistry } from '../../fixtures/routes';

const routes = normalizeRouteRegistry(simpleRegistry);

describe('resolveRouteDefinition', () => {
  it('returns the route definition for a known name', () => {
    const result = resolveRouteDefinition(routes, 'Home');
    expect(result).toBe(routes['Home']);
  });

  it('returns null for an unknown route name', () => {
    const result = resolveRouteDefinition(routes, 'Unknown');
    expect(result).toBeNull();
  });

  it('is case-sensitive', () => {
    expect(resolveRouteDefinition(routes, 'home')).toBeNull();
    expect(resolveRouteDefinition(routes, 'Home')).not.toBeNull();
  });
});

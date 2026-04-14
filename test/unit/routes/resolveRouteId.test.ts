import { describe, it, expect, vi } from 'vitest';

import type {
  NavigationParams,
  NavigationRouteId,
} from '../../../src/core/public';
import { resolveRouteId } from '../../../src/routes/resolveRouteId';
import { makeRoute } from '../../helpers/testRoutes';

describe('resolveRouteId', () => {
  it('returns undefined when route has no getId', () => {
    const route = makeRoute('Home');
    expect(resolveRouteId(route, {})).toBeUndefined();
  });

  it('calls getId with the params and returns the result', () => {
    const getId: (params: NavigationParams) => NavigationRouteId | undefined =
      vi.fn().mockReturnValue('route-123');
    const route = makeRoute('Profile', { getId });
    const params = { userId: 42 };

    const result = resolveRouteId(route, params);

    expect(getId).toHaveBeenCalledWith(params);
    expect(result).toBe('route-123');
  });

  it('returns undefined when getId returns undefined', () => {
    const route = makeRoute('Profile', { getId: () => undefined });
    expect(resolveRouteId(route, { userId: 1 })).toBeUndefined();
  });
});

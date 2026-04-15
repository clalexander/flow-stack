import type { ReactNode } from 'react';

import type {
  NavigationRouteDefinition,
  NavigationRouteName,
  NavigationParams,
} from '../../src/core/public';

function StubComponent({ children }: { children?: ReactNode }): ReactNode {
  return children ?? null;
}

export function makeRoute<
  TName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
>(
  name: TName,
  overrides?: Partial<NavigationRouteDefinition<TName, TParams>>,
): NavigationRouteDefinition<TName, TParams> {
  return {
    name,
    component: StubComponent as NavigationRouteDefinition<
      TName,
      TParams
    >['component'],
    ...overrides,
  };
}

export function makeRouteRegistry(
  names: NavigationRouteName[],
): NavigationRouteDefinition[] {
  return names.map((name) => makeRoute(name));
}

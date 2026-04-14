import type {
  NavigationRouteDefinition,
  NavigationRouteName,
} from '../core/public';

import type { NormalizedNavigationRouteRegistry } from './normalizeRouteRegistry';

export function resolveRouteDefinition(
  routes: NormalizedNavigationRouteRegistry,
  routeName: NavigationRouteName,
): NavigationRouteDefinition | null {
  return routes[routeName] ?? null;
}

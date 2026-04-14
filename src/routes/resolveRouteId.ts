import type {
  NavigationParams,
  NavigationRouteDefinition,
  NavigationRouteId,
} from '../core/public';

export function resolveRouteId(
  route: NavigationRouteDefinition,
  params: NavigationParams,
): NavigationRouteId | undefined {
  return route.getId?.(params);
}

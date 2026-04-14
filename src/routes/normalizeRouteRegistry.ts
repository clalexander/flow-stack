import type {
  NavigationRouteDefinition,
  NavigationRouteName,
  NavigationRouteRegistry,
} from '../core/public';

export type NormalizedNavigationRouteRegistry = Readonly<
  Record<NavigationRouteName, NavigationRouteDefinition>
>;

export function normalizeRouteRegistry(
  routes: NavigationRouteRegistry,
): NormalizedNavigationRouteRegistry {
  if (Array.isArray(routes)) {
    return routes.reduce<
      Record<NavigationRouteName, NavigationRouteDefinition>
    >((acc, route) => {
      acc[route.name] = route;
      return acc;
    }, {});
  }

  return Object.fromEntries(
    Object.entries(routes).map(([name, route]) => [name, route]),
  ) as NormalizedNavigationRouteRegistry;
}

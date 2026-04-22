import type {
  NavigationRouteDefinition,
  NavigationRouteName,
  NavigationRouteRegistry,
} from '../core/public';

export type NormalizedNavigationRouteRegistry = Readonly<
  Record<NavigationRouteName, NavigationRouteDefinition>
>;

function isRouteDefinitionArray(
  routes: NavigationRouteRegistry,
): routes is readonly NavigationRouteDefinition[] {
  return Array.isArray(routes);
}

export function normalizeRouteRegistry(
  routes: NavigationRouteRegistry,
): NormalizedNavigationRouteRegistry {
  if (isRouteDefinitionArray(routes)) {
    // Cast to the default-parameterized type to erase the `any` in TParams;
    // the array is unmodified at runtime — we only need `.name` and the object reference.
    return routes.reduce<
      Record<NavigationRouteName, NavigationRouteDefinition>
    >((acc, route) => {
      acc[route.name] = route;
      return acc;
    }, {});
  }

  return Object.fromEntries(
    Object.entries(routes).map(([name, route]) => [name, route]),
  );
}

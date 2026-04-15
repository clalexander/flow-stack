import type {
  NavigationEntry,
  NavigationParams,
  NavigationRouteId,
  NavigationRouteKeyResolver,
  NavigationRouteName,
  NavigationStackId,
} from '../core/public';
import { createNavigationEntryKey } from '../utils/ids';

export function resolveRouteKey(args: {
  stackId: NavigationStackId;
  routeName: NavigationRouteName;
  params: NavigationParams;
  id?: NavigationRouteId;
  existingEntries: readonly NavigationEntry[];
  routeKeyResolver?: NavigationRouteKeyResolver;
}): string {
  const { routeKeyResolver, ...rest } = args;
  if (routeKeyResolver) {
    return routeKeyResolver(rest);
  }

  const duplicateCount = rest.id
    ? rest.existingEntries.filter((entry) => entry.id === rest.id).length
    : rest.existingEntries.filter((entry) => entry.routeName === rest.routeName)
        .length;

  const base = rest.id ?? rest.routeName;
  return `${base}:${duplicateCount}:${createNavigationEntryKey()}`;
}

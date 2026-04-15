import type {
  NavigationEntry,
  NavigationEntryInput,
  NavigationParams,
  NavigationRouteDefinition,
  NavigationRouteRef,
  NavigationRouteRegistry,
  NavigationStackState,
} from '../core/public';
import { normalizeRouteRegistry } from '../routes/normalizeRouteRegistry';
import { resolveRouteDefinition } from '../routes/resolveRouteDefinition';
import { resolveRouteId } from '../routes/resolveRouteId';
import { createNavigationEntryKey } from '../utils/ids';

export interface CreateInitialStateOptions {
  routes: NavigationRouteRegistry;
  initialEntries?: readonly NavigationEntryInput[];
  initialRoute?: NavigationRouteRef;
  initialParams?: NavigationParams;
}

function createEntry(
  route: NavigationRouteDefinition,
  params: NavigationParams,
  meta: Record<string, unknown> | undefined,
  index: number,
): NavigationEntry {
  const mergedParams: NavigationParams = {
    ...(route.defaultParams ?? {}),
    ...params,
  };

  return {
    key: createNavigationEntryKey(),
    routeName: route.name,
    params: mergedParams,
    id: resolveRouteId(route, mergedParams),
    meta,
    createdAt: Date.now() + index,
    state: 'inactive',
  };
}

export function createInitialState(
  options: CreateInitialStateOptions,
): NavigationStackState {
  const routes = normalizeRouteRegistry(options.routes);
  const requestedEntries =
    options.initialEntries && options.initialEntries.length > 0
      ? options.initialEntries
      : options.initialRoute
        ? [
            {
              name: options.initialRoute.name,
              params: {
                ...(options.initialRoute.params ?? {}),
                ...(options.initialParams ?? {}),
              },
            },
          ]
        : [];

  const entries = requestedEntries
    .map((input, index) => {
      const route = resolveRouteDefinition(routes, input.name);
      if (!route) {
        return null;
      }

      return createEntry(route, input.params ?? {}, input.meta, index);
    })
    .filter((entry): entry is NavigationEntry => entry !== null);

  const activeIndex = entries.length > 0 ? entries.length - 1 : -1;
  const normalizedEntries: NavigationEntry[] = entries.map((entry, index) => ({
    ...entry,
    state: index === activeIndex ? 'active' : 'inactive',
  }));

  return {
    entries: normalizedEntries,
    activeIndex,
    isTransitioning: false,
    lastAction: null,
    transition: null,
  };
}

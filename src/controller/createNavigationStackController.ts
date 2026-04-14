import type {
  NavigationAction,
  NavigationEntry,
  NavigationEntryInput,
  NavigationEntryMatcher,
  NavigationParams,
  NavigationRouteDefinition,
  NavigationRouteKeyResolver,
  NavigationRouteRef,
  NavigationRouteRegistry,
  NavigationStackId,
  NavigationStackState,
} from '../core/public';
import { normalizeRouteRegistry } from '../routes/normalizeRouteRegistry';
import { resolveRouteDefinition } from '../routes/resolveRouteDefinition';
import { resolveRouteId } from '../routes/resolveRouteId';
import { resolveRouteKey } from '../routes/resolveRouteKey';
import { findNavigationEntry } from '../state/matchers';
import { mergeNavigationParams } from '../state/params';

import { createInitialState } from './createInitialState';
import { navigationReducer } from './navigationReducer';
import type { NavigationStackController } from './NavigationStackController';

export interface CreateNavigationStackControllerOptions {
  id: NavigationStackId;
  routes: NavigationRouteRegistry;
  initialEntries?: readonly NavigationEntryInput[];
  initialRoute?: NavigationRouteRef;
  initialParams?: NavigationParams;
  maxDepth?: number;
  routeKeyResolver?: NavigationRouteKeyResolver;
}

function buildResolvedEntry(
  stackId: NavigationStackId,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
  existingEntries: readonly NavigationEntry[],
  routeName: string,
  params: NavigationParams | undefined,
  routeKeyResolver?: NavigationRouteKeyResolver,
): NavigationEntry {
  const route = resolveRouteDefinition(routes, routeName);
  if (!route) {
    throw new Error(`Unknown route: ${routeName}`);
  }

  const mergedParams = {
    ...(route.defaultParams ?? {}),
    ...(params ?? {}),
  };
  const id = resolveRouteId(route, mergedParams);
  const key = resolveRouteKey({
    stackId,
    routeName,
    params: mergedParams,
    id,
    existingEntries,
    routeKeyResolver,
  });

  return {
    key,
    routeName,
    params: mergedParams,
    id,
    createdAt: Date.now(),
    state: 'active',
  };
}

export function createNavigationStackController(
  options: CreateNavigationStackControllerOptions,
): NavigationStackController {
  const routes = normalizeRouteRegistry(options.routes);
  let state = createInitialState({
    routes,
    initialEntries: options.initialEntries,
    initialRoute: options.initialRoute,
    initialParams: options.initialParams,
  });

  const finalize = (nextState: NavigationStackState): NavigationStackState => ({
    ...nextState,
    entries: nextState.entries.map((entry, index) => ({
      ...entry,
      state: index === nextState.activeIndex ? 'active' : 'inactive',
    })),
    isTransitioning: false,
    transition: null,
  });

  const dispatch = (action: NavigationAction): void => {
    const stableState = state.isTransitioning ? finalize(state) : state;

    switch (action.type) {
      case 'push': {
        const nextEntry = buildResolvedEntry(
          options.id,
          routes,
          stableState.entries,
          action.route,
          action.params,
          options.routeKeyResolver,
        );
        const entries = stableState.entries.map((entry) => ({
          ...entry,
          state: 'inactive' as const,
        }));
        state = {
          ...stableState,
          entries: [...entries, nextEntry],
          activeIndex: entries.length,
          lastAction: action,
        };
        break;
      }
      case 'replace': {
        const nextEntry = buildResolvedEntry(
          options.id,
          routes,
          stableState.entries,
          action.route,
          action.params,
          options.routeKeyResolver,
        );
        if (stableState.entries.length === 0) {
          state = {
            ...stableState,
            entries: [nextEntry],
            activeIndex: 0,
            lastAction: action,
          };
        } else {
          const entries = [...stableState.entries];
          entries[stableState.activeIndex] = nextEntry;
          state = {
            ...stableState,
            entries: entries.map((entry, index) => ({
              ...entry,
              state: index === stableState.activeIndex ? 'active' : 'inactive',
            })),
            activeIndex: stableState.activeIndex,
            lastAction: action,
          };
        }
        break;
      }
      case 'setParams': {
        const currentEntry = stableState.entries[stableState.activeIndex];
        if (!currentEntry) {
          state = stableState;
          break;
        }
        const entries = [...stableState.entries];
        entries[stableState.activeIndex] = {
          ...currentEntry,
          params: mergeNavigationParams(currentEntry.params, action.params),
        };
        state = {
          ...stableState,
          entries,
          lastAction: action,
        };
        break;
      }
      case 'updateEntry': {
        const entries = stableState.entries.map((entry) =>
          entry.key === action.entryKey ? action.updater(entry) : entry,
        );
        state = {
          ...stableState,
          entries,
          lastAction: action,
        };
        break;
      }
      case 'preload': {
        // No-op for the initial controller implementation.
        state = {
          ...stableState,
          lastAction: action,
        };
        break;
      }
      default:
        state = navigationReducer(stableState, action);
        break;
    }
  };

  return {
    get stackId() {
      return options.id;
    },
    get state() {
      return state;
    },
    get entries() {
      return state.entries;
    },
    get activeEntry() {
      return state.entries[state.activeIndex] ?? null;
    },
    get depth() {
      return state.entries.length;
    },
    get canGoBack() {
      return state.entries.length > 1 && state.activeIndex > 0;
    },
    dispatch,
    push(route, params, actionOptions) {
      dispatch({ type: 'push', route, params, options: actionOptions });
    },
    replace(route, params, actionOptions) {
      dispatch({ type: 'replace', route, params, options: actionOptions });
    },
    pop(count, actionOptions) {
      dispatch({ type: 'pop', count, options: actionOptions });
    },
    popToRoot(actionOptions) {
      dispatch({ type: 'popToRoot', options: actionOptions });
    },
    popTo(matcher, actionOptions) {
      dispatch({ type: 'popTo', matcher, options: actionOptions });
    },
    reset(entries, actionOptions) {
      dispatch({ type: 'reset', entries, options: actionOptions });
    },
    setParams(params, actionOptions) {
      dispatch({ type: 'setParams', params, options: actionOptions });
    },
    updateEntry(entryKey, updater, actionOptions) {
      dispatch({
        type: 'updateEntry',
        entryKey,
        updater,
        options: actionOptions,
      });
    },
    preload(route, params, actionOptions) {
      dispatch({ type: 'preload', route, params, options: actionOptions });
    },
    getEntry(matcher: NavigationEntryMatcher) {
      return findNavigationEntry(state.entries, matcher);
    },
  };
}

import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { applyReducedMotionToTransition } from '../a11y/reducedMotion';
import { NavigationStackContext } from '../context/NavigationStackContext';
import { NavigationStackRegistryContext } from '../context/NavigationStackRegistryContext';
import { createInitialState } from '../controller/createInitialState';
import { navigationReducer } from '../controller/navigationReducer';
import type {
  NavigationAction,
  NavigationActionContext,
  NavigationActionOptions,
  NavigationActiveEntryChangeContext,
  NavigationBlockedActionContext,
  NavigationBeforeActionContext,
  NavigationEntry,
  NavigationEntryInput,
  NavigationEntryMatcher,
  NavigationParams,
  NavigationPresentation,
  NavigationReducedMotionPreference,
  NavigationRouteDefinition,
  NavigationRouteKeyResolver,
  NavigationRouteRef,
  NavigationRouteRegistry,
  NavigationStackController,
  NavigationStackId,
  NavigationStackState,
  NavigationTransitionLifecycleContext,
  NavigationTransitionPresetName,
  NavigationTransitionResolver,
  NavigationTransitionSpec,
} from '../core/public';
import { normalizeRouteRegistry } from '../routes/normalizeRouteRegistry';
import { resolveRouteDefinition } from '../routes/resolveRouteDefinition';
import { resolveRouteId } from '../routes/resolveRouteId';
import { resolveRouteKey } from '../routes/resolveRouteKey';
import { runNavigationGuards } from '../state/guards';
import { matchesNavigationEntry, findNavigationEntry } from '../state/matchers';
import { mergeNavigationParams } from '../state/params';
import { createTransitionRuntimeState } from '../transitions/createTransitionRuntimeState';
import { resolveTransition } from '../transitions/resolveTransition';

import { NavigationStackScreen } from './NavigationStackScreen';

export interface NavigationStackProviderBaseProps {
  id: NavigationStackId;
  routes?: NavigationRouteRegistry;
  maxDepth?: number;
  transition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  /**
   * Controls whether transitions are simplified or skipped for users who prefer reduced motion.
   * Defaults to `'system'` (respects the OS/browser preference).
   *
   * Note: the viewport's `reducedMotion` prop controls the aria/focus side-effects
   * (via `useNavigationTransitions().isReducedMotion`). Both props are independent —
   * this one controls the spec, the viewport one controls the consumer-side signal.
   * Pass the same value to both to keep them in sync.
   */
  reducedMotion?: NavigationReducedMotionPreference;
  routeKeyResolver?: NavigationRouteKeyResolver;

  onBeforeAction?: (context: NavigationBeforeActionContext) => boolean;
  onAction?: (context: NavigationActionContext) => void;
  onActiveEntryChange?: (context: NavigationActiveEntryChangeContext) => void;
  onDepthChange?: (depth: number) => void;
  onTransitionStart?: (context: NavigationTransitionLifecycleContext) => void;
  onTransitionEnd?: (context: NavigationTransitionLifecycleContext) => void;
  onBlockedAction?: (context: NavigationBlockedActionContext) => void;

  children?: ReactNode;
}

export interface NavigationStackProviderUncontrolledProps extends NavigationStackProviderBaseProps {
  initialRoute?: NavigationRouteRef;
  initialParams?: NavigationParams;
  initialEntries?: readonly NavigationEntryInput[];
  state?: never;
  onStateChange?: never;
}

export interface NavigationStackProviderControlledProps extends NavigationStackProviderBaseProps {
  state: NavigationStackState;
  onStateChange: (state: NavigationStackState) => void;
  initialRoute?: never;
  initialParams?: never;
  initialEntries?: never;
}

export type NavigationStackProviderProps =
  | NavigationStackProviderUncontrolledProps
  | NavigationStackProviderControlledProps;

function finalizeTransition(state: NavigationStackState): NavigationStackState {
  const actionType = state.lastAction?.type;

  let entries = [...state.entries];

  if (
    actionType === 'pop' ||
    actionType === 'popTo' ||
    actionType === 'popToRoot'
  ) {
    entries = entries.slice(0, state.activeIndex + 1);
  }

  return {
    ...state,
    entries: entries.map((entry: NavigationEntry, index: number) => ({
      ...entry,
      state: index === state.activeIndex ? 'active' : 'inactive',
    })),
    isTransitioning: false,
    transition: null,
  };
}

function resolvePresentation(
  route: NavigationRouteDefinition | null | undefined,
): NavigationPresentation {
  return route?.presentation ?? 'stack';
}

function extractRoutesFromChildren(
  children: ReactNode,
): NavigationRouteDefinition[] {
  const result: NavigationRouteDefinition[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === NavigationStackScreen) {
      result.push(child.props as NavigationRouteDefinition);
    }
  });

  return result;
}

function buildResolvedEntry(
  stackId: NavigationStackId,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
  existingEntries: readonly NavigationEntry[],
  routeName: string,
  params: NavigationParams | undefined,
  routeKeyResolver?: NavigationRouteKeyResolver,
  meta?: Record<string, unknown>,
): NavigationEntry {
  const route = resolveRouteDefinition(routes, routeName);
  if (!route) {
    throw new Error(`Unknown route: ${routeName}`);
  }

  const mergedParams: NavigationParams = {
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
    meta,
    createdAt: Date.now(),
    state: 'active',
  };
}

export function NavigationStackProvider(
  props: NavigationStackProviderProps,
): ReactElement | null {
  const routes = useMemo(() => {
    const registry =
      props.routes !== undefined
        ? props.routes
        : extractRoutesFromChildren(props.children);

    if (Array.isArray(registry) && registry.length === 0) {
      // eslint-disable-next-line no-console
      console.error(
        'NavigationStackProvider: no routes found. Pass a `routes` prop or render <NavigationStackScreen> children.',
      );
    }

    return normalizeRouteRegistry(registry);
  }, [props.routes, props.children]);
  const isControlled = props.state !== undefined;
  const [internalState, setInternalState] = useState<NavigationStackState>(() =>
    createInitialState({
      routes,
      initialEntries: isControlled ? undefined : props.initialEntries,
      initialRoute: isControlled ? undefined : props.initialRoute,
      initialParams: isControlled ? undefined : props.initialParams,
    }),
  );
  const state = isControlled ? props.state : internalState;
  const stateRef = useRef<NavigationStackState>(state);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    props.onActiveEntryChange?.({
      entry: state.entries[state.activeIndex] ?? null,
    });
    props.onDepthChange?.(state.entries.length);
  }, [props, state.activeIndex, state.entries]);

  const commitState = (nextState: NavigationStackState): void => {
    if (isControlled) {
      props.onStateChange(nextState);
    } else {
      setInternalState(nextState);
    }
  };

  const dispatch = async (action: NavigationAction): Promise<void> => {
    const currentState = stateRef.current.isTransitioning
      ? finalizeTransition(stateRef.current)
      : stateRef.current;

    if (props.onBeforeAction?.({ action, state: currentState }) === false) {
      props.onBlockedAction?.({
        action,
        state: currentState,
        reason: 'Action was blocked by onBeforeAction.',
      });
      return;
    }

    const currentEntry = currentState.entries[currentState.activeIndex] ?? null;

    const currentRoute = currentEntry
      ? resolveRouteDefinition(routes, currentEntry.routeName)
      : null;

    let nextState: NavigationStackState = currentState;
    let nextEntry: NavigationEntry | null = currentEntry;
    let nextRoute: NavigationRouteDefinition | null = currentRoute;

    switch (action.type) {
      case 'push': {
        if (props.maxDepth && currentState.entries.length >= props.maxDepth) {
          props.onBlockedAction?.({
            action,
            state: currentState,
            reason: 'maxDepth exceeded',
          });
          return;
        }
        nextEntry = buildResolvedEntry(
          props.id,
          routes,
          currentState.entries,
          action.route,
          action.params,
          props.routeKeyResolver,
        );
        nextRoute = resolveRouteDefinition(routes, nextEntry.routeName);
        nextState = {
          ...currentState,
          entries: [
            ...currentState.entries.map((entry: NavigationEntry) => ({
              ...entry,
              state: 'inactive' as const,
            })),
            { ...nextEntry, state: 'entering' as const },
          ],
          activeIndex: currentState.entries.length,
          lastAction: action,
          isTransitioning: true,
          transition: null,
        };
        break;
      }
      case 'replace': {
        nextEntry = buildResolvedEntry(
          props.id,
          routes,
          currentState.entries,
          action.route,
          action.params,
          props.routeKeyResolver,
        );
        nextRoute = resolveRouteDefinition(routes, nextEntry.routeName);
        if (currentState.entries.length === 0) {
          nextState = {
            ...currentState,
            entries: [{ ...nextEntry, state: 'entering' }],
            activeIndex: 0,
            lastAction: action,
            isTransitioning: true,
            transition: null,
          };
        } else {
          const entries = [...currentState.entries];
          const activeIndex = currentState.activeIndex;
          entries[activeIndex] = { ...nextEntry, state: 'entering' };
          nextState = {
            ...currentState,
            entries: entries.map((entry: NavigationEntry, index: number) => ({
              ...entry,
              state: index === activeIndex ? 'entering' : 'inactive',
            })),
            activeIndex,
            lastAction: action,
            isTransitioning: true,
            transition: null,
          };
        }
        break;
      }
      case 'pop': {
        if (currentState.entries.length <= 1 || currentState.activeIndex <= 0) {
          return;
        }
        const count = Math.max(1, action.count ?? 1);
        const nextIndex = Math.max(0, currentState.activeIndex - count);
        nextEntry = currentState.entries[nextIndex] ?? null;

        nextRoute = nextEntry
          ? resolveRouteDefinition(routes, nextEntry.routeName)
          : null;
        nextState = {
          ...currentState,
          entries: currentState.entries.map(
            (entry: NavigationEntry, index: number) => {
              if (index === nextIndex)
                return { ...entry, state: 'entering' as const };
              if (index === currentState.activeIndex)
                return { ...entry, state: 'exiting' as const };
              return { ...entry, state: 'inactive' as const };
            },
          ),
          activeIndex: nextIndex,
          lastAction: action,
          isTransitioning: true,
          transition: null,
        };
        break;
      }
      case 'popToRoot': {
        if (currentState.entries.length <= 1 || currentState.activeIndex <= 0) {
          return;
        }
        nextEntry = currentState.entries[0] ?? null;

        nextRoute = nextEntry
          ? resolveRouteDefinition(routes, nextEntry.routeName)
          : null;
        nextState = {
          ...currentState,
          entries: currentState.entries.map(
            (entry: NavigationEntry, index: number) => {
              if (index === 0) return { ...entry, state: 'entering' as const };
              if (index === currentState.activeIndex)
                return { ...entry, state: 'exiting' as const };
              return { ...entry, state: 'inactive' as const };
            },
          ),
          activeIndex: 0,
          lastAction: action,
          isTransitioning: true,
          transition: null,
        };
        break;
      }
      case 'popTo': {
        const index = currentState.entries.findIndex(
          (entry: NavigationEntry, entryIndex: number) =>
            matchesNavigationEntry(
              action.matcher,
              entry,
              entryIndex,
              currentState.entries,
            ),
        );
        if (index < 0 || index === currentState.activeIndex) {
          return;
        }
        nextEntry = currentState.entries[index] ?? null;

        nextRoute = nextEntry
          ? resolveRouteDefinition(routes, nextEntry.routeName)
          : null;
        nextState = {
          ...currentState,
          entries: currentState.entries.map(
            (entry: NavigationEntry, entryIndex: number) => {
              if (entryIndex === index)
                return { ...entry, state: 'entering' as const };
              if (entryIndex === currentState.activeIndex)
                return { ...entry, state: 'exiting' as const };
              return { ...entry, state: 'inactive' as const };
            },
          ),
          activeIndex: index,
          lastAction: action,
          isTransitioning: true,
          transition: null,
        };
        break;
      }
      case 'reset': {
        nextState = createInitialState({
          routes,
          initialEntries: action.entries,
        });
        nextEntry = nextState.entries[nextState.activeIndex] ?? null;

        nextRoute = nextEntry
          ? resolveRouteDefinition(routes, nextEntry.routeName)
          : null;
        nextState = {
          ...nextState,
          lastAction: action,

          isTransitioning: Boolean(currentEntry && nextEntry),
          transition: null,
        };
        if (nextState.isTransitioning) {
          nextState = {
            ...nextState,
            entries: nextState.entries.map(
              (entry: NavigationEntry, index: number) => ({
                ...entry,
                state:
                  index === nextState.activeIndex ? 'entering' : 'inactive',
              }),
            ),
          };
        }
        break;
      }
      case 'setParams': {
        if (!currentEntry) {
          return;
        }
        const entries = [...currentState.entries];
        entries[currentState.activeIndex] = {
          ...currentEntry,
          params: mergeNavigationParams(currentEntry.params, action.params),
        };
        nextState = {
          ...currentState,
          entries,
          lastAction: action,
          isTransitioning: false,
          transition: null,
        };
        break;
      }
      case 'updateEntry':
      case 'preload':
      default: {
        nextState = navigationReducer(currentState, action);
        nextEntry = nextState.entries[nextState.activeIndex] ?? null;

        nextRoute = nextEntry
          ? resolveRouteDefinition(routes, nextEntry.routeName)
          : null;
        break;
      }
    }

    const guardsPass = await runNavigationGuards({
      action,
      currentState,
      nextState,
      currentRoute,
      nextRoute,
      stackId: props.id,
    });

    if (!guardsPass) {
      props.onBlockedAction?.({
        action,
        state: currentState,
        reason: 'Action was blocked by route guards.',
      });
      return;
    }

    if (nextState.isTransitioning) {
      const reducedMotion = props.reducedMotion ?? 'system';
      const rawSpec = resolveTransition({
        action,
        fromEntry: currentEntry,
        toEntry: nextEntry,
        depth: nextState.entries.length,
        anchor: 'auto',
        orientation: 'auto',
        presentation: resolvePresentation(nextRoute),
        reducedMotion,
        stackTransition: props.transition,
        routeTransition: nextRoute?.transition,
        stackId: props.id,
        lastAction: currentState.lastAction,
      });
      const spec = applyReducedMotionToTransition(rawSpec, reducedMotion);
      const direction =
        action.options?.direction ??
        (action.type === 'pop' ||
        action.type === 'popTo' ||
        action.type === 'popToRoot'
          ? 'backward'
          : 'forward');
      nextState = {
        ...nextState,
        transition: createTransitionRuntimeState({
          action,
          direction,
          anchor: 'auto',
          orientation: 'auto',
          fromEntry: currentEntry,
          toEntry: nextEntry,
          spec,
        }),
      };
    }

    commitState(nextState);
    stateRef.current = nextState;
    props.onAction?.({ action, nextState });

    if (nextState.transition) {
      const lifecycleContext: NavigationTransitionLifecycleContext = {
        stackId: props.id,
        transition: nextState.transition,
        state: nextState,
      };
      props.onTransitionStart?.(lifecycleContext);

      if (timeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current);
      }

      const duration = nextState.transition.spec.duration ?? 0;
      if (duration <= 0 || typeof window === 'undefined') {
        const finalState = finalizeTransition(nextState);
        commitState(finalState);
        stateRef.current = finalState;
        props.onTransitionEnd?.({
          stackId: props.id,
          transition: lifecycleContext.transition,
          state: finalState,
        });
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        const finalState = finalizeTransition(stateRef.current);
        commitState(finalState);
        stateRef.current = finalState;
        props.onTransitionEnd?.({
          stackId: props.id,
          transition: lifecycleContext.transition,
          state: finalState,
        });
      }, duration);
    }
  };

  const controller = useMemo<NavigationStackController>(
    () => ({
      get stackId(): NavigationStackId {
        return props.id;
      },
      get state(): NavigationStackState {
        return stateRef.current;
      },
      get entries(): readonly NavigationEntry[] {
        return stateRef.current.entries;
      },
      get activeEntry(): NavigationEntry | null {
        return stateRef.current.entries[stateRef.current.activeIndex] ?? null;
      },
      get depth(): number {
        return stateRef.current.entries.length;
      },
      get canGoBack(): boolean {
        return (
          stateRef.current.entries.length > 1 &&
          stateRef.current.activeIndex > 0
        );
      },
      dispatch(action: NavigationAction): void {
        void dispatch(action);
      },
      push(
        route: string,
        params?: NavigationParams,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'push', route, params, options });
      },
      replace(
        route: string,
        params?: NavigationParams,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'replace', route, params, options });
      },
      pop(count?: number, options?: NavigationActionOptions): void {
        void dispatch({ type: 'pop', count, options });
      },
      popToRoot(options?: NavigationActionOptions): void {
        void dispatch({ type: 'popToRoot', options });
      },
      popTo(
        matcher: NavigationEntryMatcher,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'popTo', matcher, options });
      },
      reset(
        entries: readonly NavigationEntryInput[],
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'reset', entries, options });
      },
      setParams(
        params: Partial<NavigationParams>,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'setParams', params, options });
      },
      updateEntry(
        entryKey: string,
        updater: (entry: NavigationEntry) => NavigationEntry,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'updateEntry', entryKey, updater, options });
      },
      preload(
        route: string,
        params?: NavigationParams,
        options?: NavigationActionOptions,
      ): void {
        void dispatch({ type: 'preload', route, params, options });
      },
      getEntry(matcher: NavigationEntryMatcher): NavigationEntry | null {
        return findNavigationEntry(stateRef.current.entries, matcher);
      },
    }),
    [props.id],
  );

  const registry = useMemo(
    () => ({
      get(stackId: NavigationStackId): NavigationStackController | null {
        return stackId === props.id ? controller : null;
      },
      has(stackId: NavigationStackId): boolean {
        return stackId === props.id;
      },
    }),
    [controller, props.id],
  );

  return (
    <NavigationStackRegistryContext.Provider value={registry}>
      <NavigationStackContext.Provider value={{ controller, routes }}>
        {props.children}
      </NavigationStackContext.Provider>
    </NavigationStackRegistryContext.Provider>
  );
}

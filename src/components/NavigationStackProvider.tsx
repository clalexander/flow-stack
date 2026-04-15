import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useCallback,
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

/** Shared props for both controlled and uncontrolled `NavigationStackProvider` variants. */
export interface NavigationStackProviderBaseProps {
  /** Unique identifier for this stack instance. Required. */
  id: NavigationStackId;
  /**
   * Route definitions — array or record — that this stack can navigate to.
   * Routes may also be declared inline as `<NavigationStackScreen>` children.
   */
  routes?: NavigationRouteRegistry;
  /** Maximum number of entries allowed in the stack. Push actions beyond this limit are ignored. */
  maxDepth?: number;
  /** Default transition for all routes. Can be overridden per-route or per-action. */
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
   * @default 'system'
   */
  reducedMotion?: NavigationReducedMotionPreference;
  /** Custom function for generating entry keys. Defaults to the built-in monotonic key strategy. */
  routeKeyResolver?: NavigationRouteKeyResolver;

  /**
   * Called before any action is applied to the stack.
   * Return `false` to block the action entirely.
   */
  onBeforeAction?: (context: NavigationBeforeActionContext) => boolean;
  /** Called after an action has been successfully applied to the stack. */
  onAction?: (context: NavigationActionContext) => void;
  /** Called whenever the active stack entry changes. */
  onActiveEntryChange?: (context: NavigationActiveEntryChangeContext) => void;
  /** Called whenever the number of entries in the stack changes. */
  onDepthChange?: (depth: number) => void;
  /** Called when a transition animation begins. */
  onTransitionStart?: (context: NavigationTransitionLifecycleContext) => void;
  /** Called when a transition animation ends. */
  onTransitionEnd?: (context: NavigationTransitionLifecycleContext) => void;
  /** Called when an action is blocked by a guard or `onBeforeAction`. */
  onBlockedAction?: (context: NavigationBlockedActionContext) => void;

  /** `<NavigationStackScreen>` elements and/or `<NavigationStackViewport>`. */
  children?: ReactNode;
}

/**
 * Props for an uncontrolled `NavigationStackProvider`.
 * The stack manages its own state internally, starting from `initialRoute` or `initialEntries`.
 */
export interface NavigationStackProviderUncontrolledProps extends NavigationStackProviderBaseProps {
  /**
   * The route to navigate to when the stack is first created.
   * Mutually exclusive with `initialEntries`.
   */
  initialRoute?: NavigationRouteRef;
  /** Parameters passed to `initialRoute`. Ignored when `initialEntries` is provided. */
  initialParams?: NavigationParams;
  /**
   * An ordered list of entries to pre-populate the stack with on creation.
   * Mutually exclusive with `initialRoute`.
   */
  initialEntries?: readonly NavigationEntryInput[];
  state?: never;
  onStateChange?: never;
}

/**
 * Props for a controlled `NavigationStackProvider`.
 * The consumer owns the state and must update it via `onStateChange` on every action.
 */
export interface NavigationStackProviderControlledProps extends NavigationStackProviderBaseProps {
  /** The current externally-managed stack state. */
  state: NavigationStackState;
  /** Called whenever the stack state changes. The consumer must store and feed back this value. */
  onStateChange: (state: NavigationStackState) => void;
  initialRoute?: never;
  initialParams?: never;
  initialEntries?: never;
}

/**
 * Props accepted by `NavigationStackProvider`.
 * Use the uncontrolled form for self-managed state, or the controlled form to own the state externally.
 */
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

interface ActionResult {
  nextState: NavigationStackState;
  nextEntry: NavigationEntry | null;
  nextRoute: NavigationRouteDefinition | null;
}

function computePushAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'push' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
  stackId: NavigationStackId,
  maxDepth: number | undefined,
  routeKeyResolver: NavigationRouteKeyResolver | undefined,
): ActionResult | 'blocked' {
  if (maxDepth && currentState.entries.length >= maxDepth) {
    return 'blocked';
  }
  const nextEntry = buildResolvedEntry(
    stackId,
    routes,
    currentState.entries,
    action.route,
    action.params,
    routeKeyResolver,
  );
  const nextRoute = resolveRouteDefinition(routes, nextEntry.routeName);
  const nextState: NavigationStackState = {
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
  return { nextState, nextEntry, nextRoute };
}

function computeReplaceAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'replace' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
  stackId: NavigationStackId,
  routeKeyResolver: NavigationRouteKeyResolver | undefined,
): ActionResult {
  const nextEntry = buildResolvedEntry(
    stackId,
    routes,
    currentState.entries,
    action.route,
    action.params,
    routeKeyResolver,
  );
  const nextRoute = resolveRouteDefinition(routes, nextEntry.routeName);
  if (currentState.entries.length === 0) {
    return {
      nextState: {
        ...currentState,
        entries: [{ ...nextEntry, state: 'entering' }],
        activeIndex: 0,
        lastAction: action,
        isTransitioning: true,
        transition: null,
      },
      nextEntry,
      nextRoute,
    };
  }
  const entries = [...currentState.entries];
  const { activeIndex } = currentState;
  entries[activeIndex] = { ...nextEntry, state: 'entering' };
  return {
    nextState: {
      ...currentState,
      entries: entries.map((entry: NavigationEntry, index: number) => ({
        ...entry,
        state: index === activeIndex ? 'entering' : 'inactive',
      })),
      activeIndex,
      lastAction: action,
      isTransitioning: true,
      transition: null,
    },
    nextEntry,
    nextRoute,
  };
}

function computePopAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'pop' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
): ActionResult | null {
  if (currentState.entries.length <= 1 || currentState.activeIndex <= 0) {
    return null;
  }
  const count = Math.max(1, action.count ?? 1);
  const nextIndex = Math.max(0, currentState.activeIndex - count);
  const nextEntry = currentState.entries[nextIndex] ?? null;
  const nextRoute = nextEntry
    ? resolveRouteDefinition(routes, nextEntry.routeName)
    : null;
  const nextState: NavigationStackState = {
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
  return { nextState, nextEntry, nextRoute };
}

function computePopToRootAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'popToRoot' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
): ActionResult | null {
  if (currentState.entries.length <= 1 || currentState.activeIndex <= 0) {
    return null;
  }
  const nextEntry = currentState.entries[0] ?? null;
  const nextRoute = nextEntry
    ? resolveRouteDefinition(routes, nextEntry.routeName)
    : null;
  const nextState: NavigationStackState = {
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
  return { nextState, nextEntry, nextRoute };
}

function computePopToAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'popTo' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
): ActionResult | null {
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
    return null;
  }
  const nextEntry = currentState.entries[index] ?? null;
  const nextRoute = nextEntry
    ? resolveRouteDefinition(routes, nextEntry.routeName)
    : null;
  const nextState: NavigationStackState = {
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
  return { nextState, nextEntry, nextRoute };
}

function computeResetAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'reset' }>,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
  currentEntry: NavigationEntry | null,
): ActionResult {
  let nextState = createInitialState({
    routes,
    initialEntries: action.entries,
  });
  const nextEntry = nextState.entries[nextState.activeIndex] ?? null;
  const nextRoute = nextEntry
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
          state: index === nextState.activeIndex ? 'entering' : 'inactive',
        }),
      ),
    };
  }
  return { nextState, nextEntry, nextRoute };
}

function computeSetParamsAction(
  currentState: NavigationStackState,
  action: Extract<NavigationAction, { type: 'setParams' }>,
  currentEntry: NavigationEntry | null,
  currentRoute: NavigationRouteDefinition | null,
): ActionResult | null {
  if (!currentEntry) {
    return null;
  }
  const entries = [...currentState.entries];
  entries[currentState.activeIndex] = {
    ...currentEntry,
    params: mergeNavigationParams(currentEntry.params, action.params),
  };
  return {
    nextState: {
      ...currentState,
      entries,
      lastAction: action,
      isTransitioning: false,
      transition: null,
    },
    nextEntry: currentEntry,
    nextRoute: currentRoute,
  };
}

function computeDefaultAction(
  currentState: NavigationStackState,
  action: NavigationAction,
  routes: Readonly<Record<string, NavigationRouteDefinition>>,
): ActionResult {
  const nextState = navigationReducer(currentState, action);
  const nextEntry = nextState.entries[nextState.activeIndex] ?? null;
  const nextRoute = nextEntry
    ? resolveRouteDefinition(routes, nextEntry.routeName)
    : null;
  return { nextState, nextEntry, nextRoute };
}

function applyTransitionToState(
  nextState: NavigationStackState,
  action: NavigationAction,
  currentEntry: NavigationEntry | null,
  nextEntry: NavigationEntry | null,
  nextRoute: NavigationRouteDefinition | null,
  prevLastAction: NavigationAction | null,
  stackId: NavigationStackId,
  stackTransition: NavigationStackProviderBaseProps['transition'],
  reducedMotion: NavigationReducedMotionPreference,
): NavigationStackState {
  const rawSpec = resolveTransition({
    action,
    fromEntry: currentEntry,
    toEntry: nextEntry,
    depth: nextState.entries.length,
    anchor: 'auto',
    orientation: 'auto',
    presentation: resolvePresentation(nextRoute),
    reducedMotion,
    stackTransition,
    routeTransition: nextRoute?.transition,
    stackId,
    lastAction: prevLastAction,
  });
  const spec = applyReducedMotionToTransition(rawSpec, reducedMotion);
  const direction =
    action.options?.direction ??
    (action.type === 'pop' ||
    action.type === 'popTo' ||
    action.type === 'popToRoot'
      ? 'backward'
      : 'forward');
  return {
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

/**
 * The root context provider for a navigation stack.
 *
 * Wrap your sidebar, modal, panel, or any arbitrary container with this component
 * to enable push/pop stack-based navigation inside it. Pair with
 * `NavigationStackViewport` to render the scenes, `NavigationStackScreen` to
 * declare routes, and `useNavigationStack` to drive navigation from anywhere in
 * the subtree.
 */
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

  const propsRef = useRef<NavigationStackProviderProps>(props);
  propsRef.current = props;

  const commitState = useCallback((nextState: NavigationStackState): void => {
    const p = propsRef.current;
    if (p.state !== undefined) {
      p.onStateChange(nextState);
    } else {
      setInternalState(nextState);
    }
  }, []);

  const dispatch = useCallback(
    async (action: NavigationAction): Promise<void> => {
      const p = propsRef.current;
      const currentState = stateRef.current.isTransitioning
        ? finalizeTransition(stateRef.current)
        : stateRef.current;

      if (p.onBeforeAction?.({ action, state: currentState }) === false) {
        p.onBlockedAction?.({
          action,
          state: currentState,
          reason: 'Action was blocked by onBeforeAction.',
        });
        return;
      }

      const currentEntry =
        currentState.entries[currentState.activeIndex] ?? null;
      const currentRoute = currentEntry
        ? resolveRouteDefinition(routes, currentEntry.routeName)
        : null;

      let result: ActionResult | null | 'blocked';
      switch (action.type) {
        case 'push':
          result = computePushAction(
            currentState,
            action,
            routes,
            p.id,
            p.maxDepth,
            p.routeKeyResolver,
          );
          break;
        case 'replace':
          result = computeReplaceAction(
            currentState,
            action,
            routes,
            p.id,
            p.routeKeyResolver,
          );
          break;
        case 'pop':
          result = computePopAction(currentState, action, routes);
          break;
        case 'popToRoot':
          result = computePopToRootAction(currentState, action, routes);
          break;
        case 'popTo':
          result = computePopToAction(currentState, action, routes);
          break;
        case 'reset':
          result = computeResetAction(
            currentState,
            action,
            routes,
            currentEntry,
          );
          break;
        case 'setParams':
          result = computeSetParamsAction(
            currentState,
            action,
            currentEntry,
            currentRoute,
          );
          break;
        case 'updateEntry':
        case 'preload':
        default:
          result = computeDefaultAction(currentState, action, routes);
          break;
      }

      if (result === null) {
        return;
      }

      if (result === 'blocked') {
        p.onBlockedAction?.({
          action,
          state: currentState,
          reason: 'maxDepth exceeded',
        });
        return;
      }

      const { nextEntry, nextRoute } = result;
      let { nextState } = result;

      const guardsPass = await runNavigationGuards({
        action,
        currentState,
        nextState,
        currentRoute,
        nextRoute,
        stackId: p.id,
      });

      if (!guardsPass) {
        p.onBlockedAction?.({
          action,
          state: currentState,
          reason: 'Action was blocked by route guards.',
        });
        return;
      }

      if (nextState.isTransitioning) {
        nextState = applyTransitionToState(
          nextState,
          action,
          currentEntry,
          nextEntry,
          nextRoute,
          currentState.lastAction,
          p.id,
          p.transition,
          p.reducedMotion ?? 'system',
        );
      }

      commitState(nextState);
      stateRef.current = nextState;
      p.onAction?.({ action, nextState });

      if (nextState.transition) {
        const lifecycleContext: NavigationTransitionLifecycleContext = {
          stackId: p.id,
          transition: nextState.transition,
          state: nextState,
        };
        p.onTransitionStart?.(lifecycleContext);

        if (timeoutRef.current !== null && typeof window !== 'undefined') {
          window.clearTimeout(timeoutRef.current);
        }

        const duration = nextState.transition.spec.duration ?? 0;
        if (duration <= 0 || typeof window === 'undefined') {
          const finalState = finalizeTransition(nextState);
          commitState(finalState);
          stateRef.current = finalState;
          p.onTransitionEnd?.({
            stackId: p.id,
            transition: lifecycleContext.transition,
            state: finalState,
          });
          return;
        }

        timeoutRef.current = window.setTimeout(() => {
          const finalState = finalizeTransition(stateRef.current);
          commitState(finalState);
          stateRef.current = finalState;
          p.onTransitionEnd?.({
            stackId: p.id,
            transition: lifecycleContext.transition,
            state: finalState,
          });
        }, duration);
      }
    },
    [routes, commitState],
  );

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
    [props.id, dispatch],
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

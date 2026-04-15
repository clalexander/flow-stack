import type { ComponentType } from 'react';

import type { NavigationAction } from './actions';
import type { NavigationEntry, NavigationStackState } from './entries';
import type {
  NavigationCachePolicy,
  NavigationEntryKey,
  NavigationMeta,
  NavigationParams,
  NavigationPresentation,
  NavigationRouteId,
  NavigationRouteName,
  NavigationStackId,
  NavigationTransitionPresetName,
} from './primitives';
import type {
  NavigationTransitionResolver,
  NavigationTransitionSpec,
} from './transitions';

/** A reference to a named route, used to specify an initial or target navigation destination. */
export interface NavigationRouteRef<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** The name of the route to navigate to. */
  name: TRouteName;
  /** Optional parameters to pass to the route. */
  params?: TParams;
}

/** Context object passed to `canEnter` and `canLeave` guard functions. */
export interface NavigationGuardContext<
  TParams extends NavigationParams = NavigationParams,
> {
  /** The ID of the stack that owns this guard invocation. */
  stackId: NavigationStackId;
  /** The stack state before the pending action is applied. */
  currentState: NavigationStackState;
  /** The stack state that would result if the action is allowed. */
  nextState?: NavigationStackState;
  /** The entry that is currently active (the one that may be leaving). */
  currentEntry: NavigationEntry | null;
  /** The entry that would become active if the action is allowed. */
  nextEntry?: NavigationEntry | null;
  /** Parameters of the relevant entry (entering or leaving, depending on the guard type). */
  params: TParams;
  /** The action that triggered this guard check. */
  action: NavigationAction;
}

/**
 * The value a guard function may return to allow or block a navigation action.
 * Return `true` (or a Promise resolving to `true`) to allow, `false` to block.
 */
export type NavigationGuardResult = boolean | Promise<boolean>;

/**
 * A guard function called before a route is entered.
 * Return `false` (or a Promise resolving to `false`) to block the navigation.
 */
export type NavigationEnterGuard<
  TParams extends NavigationParams = NavigationParams,
> = (context: NavigationGuardContext<TParams>) => NavigationGuardResult;

/**
 * A guard function called before a route is left.
 * Return `false` (or a Promise resolving to `false`) to block the navigation.
 */
export type NavigationLeaveGuard<
  TParams extends NavigationParams = NavigationParams,
> = (context: NavigationGuardContext<TParams>) => NavigationGuardResult;

/** Props received by a screen component rendered inside the navigation stack. */
export interface NavigationScreenRenderProps<
  TParams extends NavigationParams = NavigationParams,
> {
  /** The stack entry associated with this screen instance. */
  entry: NavigationEntry<NavigationRouteName, TParams>;
  /** Shortcut to `entry.params`. */
  params: TParams;
  /** Whether this screen is the currently active (visible) entry. */
  isActive: boolean;
  /** Whether this screen is the first (root) entry in the stack. */
  isRoot: boolean;
  /** Zero-based position of this entry in the stack. */
  index: number;
}

/**
 * A React component type that can be used as a screen in the navigation stack.
 * It receives `NavigationScreenRenderProps` as its props.
 */
export type NavigationScreenComponent<
  TParams extends NavigationParams = NavigationParams,
> = ComponentType<NavigationScreenRenderProps<TParams>>;

/** Complete configuration for a single route in the navigation stack. */
export interface NavigationRouteDefinition<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** The unique name that identifies this route. */
  name: TRouteName;
  /** The React component to render for this route. */
  component: NavigationScreenComponent<TParams>;
  /**
   * Optional function that returns a stable identity ID from the route's params.
   * When two push actions produce the same ID, the stack can avoid creating
   * a duplicate entry for the same logical screen.
   */
  getId?: (params: TParams) => NavigationRouteId | undefined;
  /** A static title string or a function that derives the title from params. */
  title?: string | ((params: TParams) => string);
  /** Params that are shallow-merged with any caller-supplied params at push time. */
  defaultParams?: Partial<TParams>;
  /** How this route is presented — overrides the stack-level default. */
  presentation?: NavigationPresentation;
  /** Transition to use when entering or leaving this route — overrides the stack-level default. */
  transition?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec
    | NavigationTransitionResolver;
  /** Guard called before this route is entered. Return `false` to block the navigation. */
  canEnter?: NavigationEnterGuard<TParams>;
  /** Guard called before this route is left. Return `false` to block the navigation. */
  canLeave?: NavigationLeaveGuard<TParams>;
  /** Cache strategy for this route's component instance when it leaves the active position. */
  cachePolicy?: NavigationCachePolicy;
  /** Arbitrary metadata for this route, accessible in guard contexts and entry records. */
  meta?: NavigationMeta;
}

/**
 * The set of routes known to a `NavigationStackProvider`.
 * Can be either an array of route definitions or a record keyed by route name.
 * Routes may also be declared inline as `<NavigationStackScreen>` children of the provider.
 */
export type NavigationRouteRegistry =
  // `any` is required here: NavigationRouteDefinition is invariant in TParams due to
  // contravariant function parameters (getId, canEnter, canLeave). Using NavigationParams
  // would reject user-supplied routes with narrower param types (e.g. { userId: number }).
  // This is the standard TypeScript widening escape hatch for mixed-type registries.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | readonly NavigationRouteDefinition<NavigationRouteName, any>[]
  | Readonly<
      Record<
        NavigationRouteName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        NavigationRouteDefinition<NavigationRouteName, any>
      >
    >;

/** A lightweight descriptor for an entry used when building or resetting a stack. */
export interface NavigationEntryInput<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** The name of the route this entry represents. */
  name: TRouteName;
  /** Parameters to pass to the route. */
  params?: TParams;
  /** Optional metadata to attach to the created entry. */
  meta?: NavigationMeta;
}

/**
 * A function that produces a unique entry key for a given route + params combination.
 * Provide this to `NavigationStackProvider` or `createNavigationStackController` to
 * customise the default key-generation strategy.
 */
export type NavigationRouteKeyResolver = (args: {
  /** The ID of the stack that is creating this entry. */
  stackId: NavigationStackId;
  /** The name of the route being pushed. */
  routeName: NavigationRouteName;
  /** The merged params for the new entry. */
  params: NavigationParams;
  /** The optional identity ID resolved by `NavigationRouteDefinition.getId`. */
  id?: NavigationRouteId;
  /** All entries currently in the stack, for deduplication checks. */
  existingEntries: readonly NavigationEntry[];
}) => NavigationEntryKey;

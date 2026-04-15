import type { NavigationAction } from './actions';
import type {
  NavigationEntryKey,
  NavigationEntryState,
  NavigationMeta,
  NavigationParams,
  NavigationRouteId,
  NavigationRouteName,
} from './primitives';
import type { NavigationTransitionRuntimeState } from './transitions';

/** A single entry in the navigation stack representing one screen visit. */
export interface NavigationEntry<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  /** Unique key that identifies this entry instance within the stack. */
  key: NavigationEntryKey;
  /** The name of the route this entry is associated with. */
  routeName: TRouteName;
  /** Route parameters passed when this entry was created. */
  params: TParams;
  /**
   * Optional dedupe/identity ID produced by `NavigationRouteDefinition.getId`.
   * Used to avoid duplicate entries for the same logical screen instance.
   */
  id?: NavigationRouteId;
  /** Arbitrary metadata attached to this entry. */
  meta?: NavigationMeta;
  /** Unix timestamp (ms) when this entry was created. */
  createdAt: number;
  /** Current animation/visibility state of this entry. */
  state: NavigationEntryState;
}

/** A snapshot of the complete navigation stack at a point in time. */
export interface NavigationStackState {
  /** Ordered list of all current entries in the stack. */
  entries: readonly NavigationEntry[];
  /** Index into `entries` of the currently active (visible) entry. */
  activeIndex: number;
  /** Whether a transition animation is currently in progress. */
  isTransitioning: boolean;
  /** The most recently dispatched action, or `null` before the first action. */
  lastAction: NavigationAction | null;
  /** Runtime state of the active transition, or `null` when no transition is running. */
  transition: NavigationTransitionRuntimeState | null;
}

/**
 * A discriminated union for matching a specific entry in the stack.
 * Used by `popTo`, `getEntry`, and other APIs that need to locate an entry.
 */
export type NavigationEntryMatcher =
  | {
      /** Match by route name — finds the most recent entry with that route. */
      type: 'routeName';
      value: NavigationRouteName;
    }
  | {
      /** Match by the entry's unique stack key. */
      type: 'entryKey';
      value: NavigationEntryKey;
    }
  | {
      /** Match by the entry's optional dedupe/identity ID. */
      type: 'id';
      value: NavigationRouteId;
    }
  | {
      /** Match using a custom predicate function. */
      type: 'predicate';
      value: (
        entry: NavigationEntry,
        index: number,
        entries: readonly NavigationEntry[],
      ) => boolean;
    };

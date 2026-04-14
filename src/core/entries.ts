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

export interface NavigationEntry<
  TRouteName extends NavigationRouteName = NavigationRouteName,
  TParams extends NavigationParams = NavigationParams,
> {
  key: NavigationEntryKey;
  routeName: TRouteName;
  params: TParams;
  id?: NavigationRouteId;
  meta?: NavigationMeta;
  createdAt: number;
  state: NavigationEntryState;
}

export interface NavigationStackState {
  entries: readonly NavigationEntry[];
  activeIndex: number;
  isTransitioning: boolean;
  lastAction: NavigationAction | null;
  transition: NavigationTransitionRuntimeState | null;
}

export type NavigationEntryMatcher =
  | {
      type: 'routeName';
      value: NavigationRouteName;
    }
  | {
      type: 'entryKey';
      value: NavigationEntryKey;
    }
  | {
      type: 'id';
      value: NavigationRouteId;
    }
  | {
      type: 'predicate';
      value: (
        entry: NavigationEntry,
        index: number,
        entries: readonly NavigationEntry[],
      ) => boolean;
    };

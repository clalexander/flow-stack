import type { NavigationAction } from './actions';
import type { NavigationEntry, NavigationStackState } from './entries';
import type { NavigationStackId } from './primitives';
import type { NavigationTransitionRuntimeState } from './transitions';

export interface NavigationBeforeActionContext {
  action: NavigationAction;
  state: NavigationStackState;
}

export interface NavigationBlockedActionContext {
  action: NavigationAction;
  state: NavigationStackState;
  reason: string;
}

export interface NavigationActionContext {
  action: NavigationAction;
  nextState: NavigationStackState;
}

export interface NavigationTransitionLifecycleContext {
  stackId: NavigationStackId;
  transition: NavigationTransitionRuntimeState;
  state: NavigationStackState;
}

export interface NavigationActiveEntryChangeContext {
  entry: NavigationEntry | null;
}

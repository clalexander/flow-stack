import type { NavigationAction } from './actions';
import type { NavigationEntry, NavigationStackState } from './entries';
import type { NavigationStackId } from './primitives';
import type { NavigationTransitionRuntimeState } from './transitions';

/** Context passed to `onBeforeAction` — called before any action is applied to the stack. */
export interface NavigationBeforeActionContext {
  /** The action about to be dispatched. */
  action: NavigationAction;
  /** The current stack state before the action is applied. */
  state: NavigationStackState;
}

/** Context passed to `onBlockedAction` — called when an action is prevented by a guard. */
export interface NavigationBlockedActionContext {
  /** The action that was blocked. */
  action: NavigationAction;
  /** The stack state at the time the action was blocked. */
  state: NavigationStackState;
  /** A string describing why the action was blocked. */
  reason: string;
}

/** Context passed to `onAction` — called after an action has been applied to the stack. */
export interface NavigationActionContext {
  /** The action that was dispatched. */
  action: NavigationAction;
  /** The new stack state after the action was applied. */
  nextState: NavigationStackState;
}

/** Context passed to `onTransitionStart` and `onTransitionEnd` lifecycle callbacks. */
export interface NavigationTransitionLifecycleContext {
  /** The ID of the stack this transition belongs to. */
  stackId: NavigationStackId;
  /** The runtime transition object that describes the in-progress animation. */
  transition: NavigationTransitionRuntimeState;
  /** The stack state at the time of the transition lifecycle event. */
  state: NavigationStackState;
}

/** Context passed to `onActiveEntryChange` — called when the active stack entry changes. */
export interface NavigationActiveEntryChangeContext {
  /** The new active entry, or `null` if the stack is empty. */
  entry: NavigationEntry | null;
}

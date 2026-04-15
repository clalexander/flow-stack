import type {
  NavigationAction,
  NavigationAnchor,
  NavigationDirection,
  NavigationEntry,
  NavigationOrientation,
  NavigationTransitionRuntimeState,
  NavigationTransitionSpec,
} from '../core/public';
import { createNavigationId } from '../utils/ids';

export interface CreateTransitionRuntimeStateOptions {
  action: NavigationAction;
  direction: NavigationDirection;
  anchor: NavigationAnchor;
  orientation: NavigationOrientation;
  fromEntry: NavigationEntry | null;
  toEntry: NavigationEntry | null;
  spec: NavigationTransitionSpec;
}

export function createTransitionRuntimeState(
  options: CreateTransitionRuntimeStateOptions,
): NavigationTransitionRuntimeState {
  return {
    id: createNavigationId(),
    actionType: options.action.type,
    direction: options.direction,
    anchor: options.anchor,
    orientation: options.orientation,
    phase: 'enter',
    progress: 0,
    fromEntry: options.fromEntry,
    toEntry: options.toEntry,
    spec: options.spec,
    startedAt: Date.now(),
  };
}

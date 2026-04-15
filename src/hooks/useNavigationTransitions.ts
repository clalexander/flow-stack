import { useContext } from 'react';

import { resolveReducedMotionPreference } from '../a11y/reducedMotion';
import { NavigationViewportContext } from '../context/NavigationViewportContext';
import type {
  NavigationAnchor,
  NavigationDirection,
  NavigationEntry,
  NavigationScenePhase,
  NavigationStackId,
  NavigationTransitionRuntimeState,
} from '../core/public';

import { useNavigationStack } from './useNavigationStack';

/**
 * Live transition state returned by `useNavigationTransitions`.
 * Useful for building custom animated scene wrappers.
 */
export interface UseNavigationTransitionsResult {
  /** The current animation phase, or `null` when no transition is in progress. */
  phase: NavigationScenePhase | null;
  /** Animation progress from `0` (start) to `1` (complete). `0` when not transitioning. */
  progress: number;
  /** The resolved animation direction, or `null` when not transitioning. */
  direction: NavigationDirection | null;
  /** The entry that is leaving during the active transition, or `null`. */
  fromEntry: NavigationEntry | null;
  /** The entry that is entering during the active transition, or `null`. */
  toEntry: NavigationEntry | null;
  /** The anchor edge reported by the nearest `NavigationStackViewport`, or `null`. */
  anchor: NavigationAnchor | null;
  /**
   * Whether reduced-motion is in effect according to the viewport's `reducedMotion` prop.
   * `false` when no viewport context is present.
   */
  isReducedMotion: boolean;
  /** The full runtime transition state object, or `null` when not transitioning. */
  transition: NavigationTransitionRuntimeState | null;
}

/**
 * Returns the live transition state for the resolved stack.
 * Combines data from the nearest `NavigationStackProvider` and `NavigationStackViewport`.
 *
 * @param stackId - Optional ID of a specific stack to target. When omitted, uses the nearest provider.
 * @returns The current transition state and viewport metadata.
 */
export function useNavigationTransitions(
  stackId?: NavigationStackId,
): UseNavigationTransitionsResult {
  const navigation = useNavigationStack(stackId);
  const viewport = useContext(NavigationViewportContext);
  const transition =
    navigation.state.transition ?? viewport?.transition ?? null;

  return {
    phase: transition?.phase ?? null,
    progress: transition?.progress ?? 0,
    direction: transition?.direction ?? viewport?.direction ?? null,
    fromEntry: transition?.fromEntry ?? null,
    toEntry: transition?.toEntry ?? null,
    anchor: viewport?.anchor ?? null,
    isReducedMotion: viewport
      ? resolveReducedMotionPreference(viewport.reducedMotion)
      : false,
    transition,
  };
}

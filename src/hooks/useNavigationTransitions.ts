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

export interface UseNavigationTransitionsResult {
  phase: NavigationScenePhase | null;
  progress: number;
  direction: NavigationDirection | null;
  fromEntry: NavigationEntry | null;
  toEntry: NavigationEntry | null;
  anchor: NavigationAnchor | null;
  isReducedMotion: boolean;
  transition: NavigationTransitionRuntimeState | null;
}

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

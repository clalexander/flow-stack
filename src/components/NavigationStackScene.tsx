import { type CSSProperties, type ReactNode } from 'react';

import type {
  NavigationEntry,
  NavigationScenePhase,
  NavigationTransitionRuntimeState,
  NavigationZIndexStrategy,
} from '../core/public';

/**
 * Props for an individual scene container rendered inside `NavigationStackViewport`.
 * These are set by the viewport and are not typically supplied by consumers directly
 * unless implementing a custom `renderScene` function.
 */
export interface NavigationStackSceneProps {
  /** The stack entry this scene is rendering. */
  entry: NavigationEntry;
  /** Zero-based stack position of this entry. */
  index: number;
  /** Whether this scene is the currently active entry. */
  isActive: boolean;
  /** Whether this scene is the first (root) entry in the stack. */
  isRoot: boolean;
  /** Current lifecycle phase of this scene's animation. */
  phase: NavigationScenePhase;
  /** Runtime transition state while a transition is in-progress, or `null` when idle. */
  transitionState: NavigationTransitionRuntimeState | null;
  /** How `z-index` values are assigned to this scene. */
  zIndexStrategy?: NavigationZIndexStrategy;
  /** Keyframe name produced by `buildAnimationKeyframes` and injected by the viewport. */
  animationName?: string;
  /** Phase-specific easing (`enterCurve` / `exitCurve` / `easing` fallback). */
  animationEasing?: string;
  /** Stagger-based delay in milliseconds (`spec.stagger × sceneIndex`). */
  animationDelay?: number;
  /** When true, applies `overflow: hidden` to clip scene content during the transition. */
  clipContent?: boolean;
  children?: ReactNode;
}

export function NavigationStackScene(
  props: NavigationStackSceneProps,
): ReactNode {
  const duration = props.transitionState?.spec.duration ?? 250;
  const easing = props.animationEasing ?? 'ease';
  const delay = props.animationDelay ?? 0;

  const style: CSSProperties = {
    position: props.transitionState
      ? 'absolute'
      : props.isActive
        ? 'relative'
        : 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex:
      props.zIndexStrategy === 'explicit'
        ? props.phase === 'enter'
          ? props.index + 1
          : props.index
        : props.phase === 'enter'
          ? 2
          : props.phase === 'exit'
            ? 1
            : props.isActive
              ? 2
              : 0,
    pointerEvents: props.isActive ? 'auto' : 'none',
    visibility: props.isActive || props.transitionState ? 'visible' : 'hidden',
    overflow: props.clipContent ? 'hidden' : undefined,
    animation: props.animationName
      ? `${props.animationName} ${duration}ms ${easing} ${delay}ms both`
      : undefined,
  };

  return (
    <div
      data-navigation-entry-key={props.entry.key}
      data-navigation-scene-phase={props.phase}
      style={style}
    >
      {props.children}
    </div>
  );
}

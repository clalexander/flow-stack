import { type CSSProperties, type ReactElement, type ReactNode } from 'react';

import type {
  NavigationEntry,
  NavigationScenePhase,
  NavigationTransitionRuntimeState,
  NavigationZIndexStrategy,
} from '../core/public';

export interface NavigationStackSceneProps {
  entry: NavigationEntry;
  index: number;
  isActive: boolean;
  isRoot: boolean;
  phase: NavigationScenePhase;
  transitionState: NavigationTransitionRuntimeState | null;
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
): ReactElement | null {
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

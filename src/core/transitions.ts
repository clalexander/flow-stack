import type { NavigationAction } from './actions';
import type { NavigationEntry } from './entries';
import type {
  NavigationAnchor,
  NavigationDirection,
  NavigationOrientation,
  NavigationPresentation,
  NavigationReducedMotionPreference,
  NavigationScenePhase,
  NavigationTransitionAxis,
  NavigationTransitionCurveToken,
  NavigationTransitionPresetName,
  NavigationStackId,
} from './primitives';

/** Opacity animation endpoints for an enter or exit transition. */
export interface NavigationTransitionOpacityConfig {
  /** Starting opacity value (0–1). */
  from?: number;
  /** Ending opacity value (0–1). */
  to?: number;
}

/** Translate (slide) animation endpoints for an enter or exit transition. */
export interface NavigationTransitionTranslateConfig {
  /** The CSS transform axis to slide along. */
  axis?: NavigationTransitionAxis;
  /** Starting translate value — number (pixels) or CSS string (e.g. `'100%'`). */
  from?: number | string;
  /** Ending translate value — number (pixels) or CSS string (e.g. `'0%'`). */
  to?: number | string;
}

/** Scale animation endpoints for an enter or exit transition. */
export interface NavigationTransitionScaleConfig {
  /** Starting scale factor. */
  from?: number;
  /** Ending scale factor. */
  to?: number;
}

/**
 * Full specification for a navigation transition animation.
 * Fields can be omitted; unset fields fall back to the built-in preset defaults.
 * When a `preset` is given, its values serve as the baseline that other fields override.
 */
export interface NavigationTransitionSpec {
  /** A built-in preset to base this spec on. */
  preset?: NavigationTransitionPresetName;
  /** Total animation duration in milliseconds. */
  duration?: number;
  /** Default easing for both enter and exit phases. Overridden by `enterCurve`/`exitCurve`. */
  easing?: NavigationTransitionCurveToken | ((progress: number) => number);
  /** Easing applied specifically to the entering scene. */
  enterCurve?: NavigationTransitionCurveToken;
  /** Easing applied specifically to the exiting scene. */
  exitCurve?: NavigationTransitionCurveToken;
  /** Delay (ms) added per scene index, creating a staggered multi-scene effect. */
  stagger?: number;
  /** Opacity animation declaration. */
  opacity?: NavigationTransitionOpacityConfig;
  /** Translate (slide) animation declaration. */
  translate?: NavigationTransitionTranslateConfig;
  /** Scale animation declaration. */
  scale?: NavigationTransitionScaleConfig;
  /** When `true`, applies `overflow: hidden` to each scene during the transition. */
  clip?: boolean;
  /**
   * When `true`, the translate direction is inverted for backward navigation,
   * so scenes slide back out the way they came in.
   */
  reverseOnBack?: boolean;
  /**
   * Alternative transition spec (or preset name) to use when reduced-motion is active.
   * Falls back to `{ ...spec, duration: 0 }` if not set.
   */
  reducedMotionPreset?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec;
}

/** Context passed to a `NavigationTransitionResolver` function to compute a transition spec. */
export interface NavigationTransitionResolverContext {
  /** The ID of the stack this transition belongs to. */
  stackId: NavigationStackId;
  /** The type of action that triggered this transition. */
  actionType: NavigationAction['type'];
  /** The resolved navigation direction (forward / backward / neutral). */
  direction: NavigationDirection;
  /** The entry that is leaving (or `null` on first push). */
  fromEntry: NavigationEntry | null;
  /** The entry that is entering. */
  toEntry: NavigationEntry | null;
  /** Current stack depth (number of entries). */
  depth: number;
  /** The viewport's anchor edge at the time of the transition. */
  anchor: NavigationAnchor;
  /** Resolved orientation (horizontal or vertical). */
  orientation: NavigationOrientation;
  /** The route's configured presentation mode. */
  presentation: NavigationPresentation;
  /** The effective reduced-motion preference at the time of the transition. */
  reducedMotion: NavigationReducedMotionPreference;
  /** The action that preceded this transition, if any. */
  lastAction: NavigationAction | null;
}

/**
 * A function that returns a `NavigationTransitionSpec` (or `undefined` to defer)
 * based on the given transition context. Returning `undefined` falls back to the
 * route-level or stack-level transition configuration.
 */
export type NavigationTransitionResolver = (
  context: NavigationTransitionResolverContext,
) => NavigationTransitionSpec | NavigationTransitionPresetName | undefined;

/** Live runtime state of an in-progress navigation transition. */
export interface NavigationTransitionRuntimeState {
  /** Unique identifier for this transition instance. */
  id: string;
  /** The action type that triggered this transition. */
  actionType: NavigationAction['type'];
  /** The resolved animation direction. */
  direction: NavigationDirection;
  /** The viewport anchor at the time this transition started. */
  anchor: NavigationAnchor;
  /** Resolved animation orientation. */
  orientation: NavigationOrientation;
  /** Current lifecycle phase of the transition. */
  phase: NavigationScenePhase;
  /** Animation progress from `0` (start) to `1` (complete). */
  progress: number;
  /** The entry that is leaving. `null` on the initial push. */
  fromEntry: NavigationEntry | null;
  /** The entry that is entering. */
  toEntry: NavigationEntry | null;
  /** The resolved transition spec used to drive the animation. */
  spec: NavigationTransitionSpec;
  /** Unix timestamp (ms) when this transition started. */
  startedAt: number;
}

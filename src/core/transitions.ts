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

export interface NavigationTransitionOpacityConfig {
  from?: number;
  to?: number;
}

export interface NavigationTransitionTranslateConfig {
  axis?: NavigationTransitionAxis;
  from?: number | string;
  to?: number | string;
}

export interface NavigationTransitionScaleConfig {
  from?: number;
  to?: number;
}

export interface NavigationTransitionSpec {
  preset?: NavigationTransitionPresetName;
  duration?: number;
  easing?: NavigationTransitionCurveToken | ((progress: number) => number);
  enterCurve?: NavigationTransitionCurveToken;
  exitCurve?: NavigationTransitionCurveToken;
  stagger?: number;
  opacity?: NavigationTransitionOpacityConfig;
  translate?: NavigationTransitionTranslateConfig;
  scale?: NavigationTransitionScaleConfig;
  clip?: boolean;
  reverseOnBack?: boolean;
  reducedMotionPreset?:
    | NavigationTransitionPresetName
    | NavigationTransitionSpec;
}

export interface NavigationTransitionResolverContext {
  stackId: NavigationStackId;
  actionType: NavigationAction['type'];
  direction: NavigationDirection;
  fromEntry: NavigationEntry | null;
  toEntry: NavigationEntry | null;
  depth: number;
  anchor: NavigationAnchor;
  orientation: NavigationOrientation;
  presentation: NavigationPresentation;
  reducedMotion: NavigationReducedMotionPreference;
  lastAction: NavigationAction | null;
}

export type NavigationTransitionResolver = (
  context: NavigationTransitionResolverContext,
) => NavigationTransitionSpec | undefined;

export interface NavigationTransitionRuntimeState {
  id: string;
  actionType: NavigationAction['type'];
  direction: NavigationDirection;
  anchor: NavigationAnchor;
  orientation: NavigationOrientation;
  phase: NavigationScenePhase;
  progress: number;
  fromEntry: NavigationEntry | null;
  toEntry: NavigationEntry | null;
  spec: NavigationTransitionSpec;
  startedAt: number;
}

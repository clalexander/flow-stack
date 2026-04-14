export type NavigationRouteName = string;
export type NavigationEntryKey = string;
export type NavigationRouteId = string;
export type NavigationStackId = string;

export type NavigationParams = Record<string, unknown>;
export type NavigationMeta = Record<string, unknown>;

export type NavigationAnchor =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'center'
  | 'auto';

export type NavigationOrientation = 'horizontal' | 'vertical' | 'auto';

export type NavigationPresentation = 'stack' | 'replace' | 'overlay';

export type NavigationDirection = 'forward' | 'backward' | 'neutral' | 'auto';

export type NavigationMountStrategy =
  | 'active-only'
  | 'active-plus-previous'
  | 'keep-alive';

export type NavigationOverflowBehavior = 'clip' | 'visible';

export type NavigationZIndexStrategy = 'auto' | 'explicit';

export type NavigationReducedMotionPreference = 'system' | 'always' | 'never';

export type NavigationAnchorAnimationPolicy =
  | 'follow-anchor'
  | 'invert-anchor'
  | 'fixed-forward'
  | 'fixed-backward'
  | 'fade-only';

export type NavigationFocusBehavior = 'auto' | 'preserve' | 'reset';

export type NavigationScrollBehavior = 'preserve' | 'reset-top';

export type NavigationInterruptPolicy = 'queue' | 'cancel-current' | 'ignore';

export type NavigationScenePhase = 'enter' | 'active' | 'exit' | 'inactive';

export type NavigationEntryState =
  | 'entering'
  | 'active'
  | 'exiting'
  | 'inactive';

export type NavigationCachePolicy = 'unmount' | 'keep-mounted' | 'keep-warm';

export type NavigationAriaLiveMode = 'off' | 'polite';

export type NavigationTransitionPresetName =
  | 'slide-inline'
  | 'slide-opposite'
  | 'slide-up'
  | 'slide-down'
  | 'fade'
  | 'fade-scale'
  | 'crossfade'
  | 'none';

export type NavigationTransitionAxis = 'x' | 'y';

export type NavigationTransitionCurveToken =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | (string & {});

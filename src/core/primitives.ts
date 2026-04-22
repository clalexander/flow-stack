/** A string identifier for a named route in the navigation stack. */
export type NavigationRouteName = string;

/** A unique string key that identifies a single entry in the navigation stack. */
export type NavigationEntryKey = string;

/**
 * An optional dedupe/identity ID for a route entry, produced by
 * `NavigationRouteDefinition.getId`. When two push actions produce the same ID,
 * the stack can reuse or replace the existing entry.
 */
export type NavigationRouteId = string;

/** A string identifier for a `NavigationStackProvider` instance. */
export type NavigationStackId = string;

/** A generic record of route parameters passed to a screen. */
export type NavigationParams = Record<string, unknown>;

/** Arbitrary metadata attached to a route definition or stack entry. */
export type NavigationMeta = Record<string, unknown>;

/**
 * The anchor edge of the viewport — determines which side scenes slide in/out from.
 * `'auto'` defers to the viewport's `anchorAnimationPolicy` calculation.
 */
export type NavigationAnchor =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'center'
  | 'auto';

/** The scroll axis of the transition animation. `'auto'` is resolved from the `anchor`. */
export type NavigationOrientation = 'horizontal' | 'vertical' | 'auto';

/**
 * How a new entry is presented relative to the stack:
 * - `'stack'` — pushes on top, preserving the back-stack.
 * - `'replace'` — replaces the current active entry.
 * - `'overlay'` — renders on top without removing the entry beneath.
 */
export type NavigationPresentation = 'stack' | 'replace' | 'overlay';

/**
 * The conceptual direction of a navigation transition:
 * - `'forward'` — navigating deeper (push).
 * - `'backward'` — navigating back (pop).
 * - `'neutral'` — no directional animation (reset, replace).
 * - `'auto'` — inferred from the action type.
 */
export type NavigationDirection = 'forward' | 'backward' | 'neutral' | 'auto';

/**
 * Controls which entries the viewport keeps mounted in the DOM:
 * - `'active-only'` — only the active scene is mounted.
 * - `'active-plus-previous'` — the active and immediately previous scenes are mounted.
 * - `'keep-alive'` — all entries that have ever been active remain mounted.
 */
export type NavigationMountStrategy =
  | 'active-only'
  | 'active-plus-previous'
  | 'keep-alive';

/**
 * How content is clipped at the viewport boundary during transitions:
 * - `'clip'` — applies `overflow: hidden` to the viewport container.
 * - `'visible'` — allows scenes to bleed outside the viewport bounds.
 */
export type NavigationOverflowBehavior = 'clip' | 'visible';

/**
 * How `z-index` values are assigned to scenes:
 * - `'auto'` — entering scene gets `z-index: 2`, exiting gets `1`, others `0`.
 * - `'explicit'` — `z-index` mirrors the entry's position index in the stack.
 */
export type NavigationZIndexStrategy = 'auto' | 'explicit';

/**
 * How the stack responds to the OS/browser reduced-motion preference:
 * - `'system'` — reads `prefers-reduced-motion` from the media query.
 * - `'always'` — always treats motion as reduced, regardless of system setting.
 * - `'never'` — always plays full animations, regardless of system setting.
 */
export type NavigationReducedMotionPreference = 'system' | 'always' | 'never';

/**
 * Determines how transition direction and orientation are derived from the viewport `anchor`:
 * - `'follow-anchor'` — direction follows the anchor (default behaviour).
 * - `'invert-anchor'` — direction is the opposite of the anchor.
 * - `'fixed-forward'` — always forward regardless of anchor.
 * - `'fixed-backward'` — always backward regardless of anchor.
 * - `'fade-only'` — direction is `'neutral'` and orientation is `'auto'` (no slide).
 */
export type NavigationAnchorAnimationPolicy =
  | 'follow-anchor'
  | 'invert-anchor'
  | 'fixed-forward'
  | 'fixed-backward'
  | 'fade-only';

/**
 * Controls where keyboard focus moves after a navigation action:
 * - `'auto'` — focuses the first focusable element in the incoming scene, or the container.
 * - `'preserve'` — leaves focus unchanged.
 * - `'reset'` — focuses the scene container element itself.
 */
export type NavigationFocusBehavior = 'auto' | 'preserve' | 'reset';

/**
 * Controls scroll position after a navigation action:
 * - `'preserve'` — retains the current scroll position.
 * - `'reset-top'` — scrolls the scene container back to the top.
 */
export type NavigationScrollBehavior = 'preserve' | 'reset-top';

/**
 * How concurrent navigation actions are handled when one is already in progress:
 * - `'queue'` — the incoming action waits for the current one to finish.
 * - `'cancel-current'` — the in-flight action is cancelled and the new one runs immediately.
 * - `'ignore'` — the incoming action is dropped.
 */
export type NavigationInterruptPolicy = 'queue' | 'cancel-current' | 'ignore';

/**
 * The lifecycle phase of a scene in the viewport:
 * - `'enter'` — the scene is animating in.
 * - `'active'` — the scene is fully visible and interactive.
 * - `'exit'` — the scene is animating out.
 * - `'inactive'` — the scene is hidden (either unmounted or `visibility: hidden`).
 */
export type NavigationScenePhase = 'enter' | 'active' | 'exit' | 'inactive';

/**
 * The animation/visibility state of a stack entry:
 * - `'entering'` — the entry is being animated in.
 * - `'active'` — the entry is fully active and visible.
 * - `'exiting'` — the entry is being animated out.
 * - `'inactive'` — the entry is in the back-stack but not visible.
 */
export type NavigationEntryState =
  | 'entering'
  | 'active'
  | 'exiting'
  | 'inactive';

/**
 * Cache behaviour for a route's component instance:
 * - `'unmount'` — the component is unmounted when the entry leaves the active position.
 * - `'keep-mounted'` — the component stays mounted but is hidden when inactive.
 * - `'keep-warm'` — the component is pre-rendered and kept ready in the background.
 */
export type NavigationCachePolicy = 'unmount' | 'keep-mounted' | 'keep-warm';

/**
 * ARIA live region mode for the navigation viewport:
 * - `'off'` — screen readers do not announce transitions.
 * - `'polite'` — screen readers announce the new scene after the current speech finishes.
 */
export type NavigationAriaLiveMode = 'off' | 'polite';

/**
 * Built-in named transition presets that can be referenced by name wherever a transition
 * is accepted. Each is resolved to a full `NavigationTransitionSpec` at runtime.
 */
export type NavigationTransitionPresetName =
  | 'slide-inline'
  | 'slide-opposite'
  | 'slide-up'
  | 'slide-down'
  | 'fade'
  | 'fade-scale'
  | 'none';

/** The CSS transform axis used for a translate transition. */
export type NavigationTransitionAxis = 'x' | 'y';

/**
 * A CSS easing identifier or custom spring token.
 * In addition to standard CSS values (`linear`, `ease`, etc.),
 * `'spring'` resolves to a damped-harmonic `linear()` easing function.
 * Any other string is passed through as a raw CSS `animation-timing-function` value.
 */
export type NavigationTransitionCurveToken =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | (string & {});

import {
  createElement,
  type CSSProperties,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  getInactiveSceneAriaAttributes,
  getNavigationViewportAriaAttributes,
} from '../a11y/aria';
import { applyNavigationFocus, restoreNavigationFocus } from '../a11y/focus';
import { NavigationStackContext } from '../context/NavigationStackContext';
import { NavigationStackRegistryContext } from '../context/NavigationStackRegistryContext';
import { NavigationViewportContext } from '../context/NavigationViewportContext';
import type {
  NavigationAnchor,
  NavigationAnchorAnimationPolicy,
  NavigationAriaLiveMode,
  NavigationEntry,
  NavigationMountStrategy,
  NavigationOrientation,
  NavigationOverflowBehavior,
  NavigationReducedMotionPreference,
  NavigationScenePhase,
  NavigationStackId,
  NavigationTransitionLifecycleContext,
  NavigationTransitionRuntimeState,
  NavigationZIndexStrategy,
} from '../core/public';
import type { NormalizedNavigationRouteRegistry } from '../routes/normalizeRouteRegistry';
import {
  buildAnimationKeyframes,
  resolveEasingCSS,
} from '../transitions/buildAnimationKeyframes';
import { resolveAnchorAnimation } from '../transitions/resolveAnchorAnimation';

import { NavigationStackScene } from './NavigationStackScene';

/**
 * Contextual data passed to a custom `renderScene` function in `NavigationStackViewport`.
 */
export interface NavigationStackSceneRenderContext {
  /** The stack entry this scene should render. */
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
}

/** Props for the `NavigationStackViewport` component. */
export interface NavigationStackViewportProps {
  /**
   * ID of the stack to render. Only required when multiple stacks are mounted
   * and this viewport should target a specific one.
   */
  stackId?: NavigationStackId;
  /**
   * The edge of the viewport from which scenes enter and exit.
   * @default 'left'
   */
  anchor?: NavigationAnchor;
  /**
   * The scroll axis of the slide animation. Inferred from `anchor` when omitted.
   */
  orientation?: NavigationOrientation;
  /**
   * How the animation direction and orientation are derived from the `anchor`.
   * @default 'follow-anchor'
   */
  anchorAnimationPolicy?: NavigationAnchorAnimationPolicy;
  /**
   * Custom scene renderer. When provided, replaces the default `NavigationStackScene`.
   * Receives `NavigationStackSceneRenderContext` and must return a `ReactNode`.
   */
  renderScene?: (scene: NavigationStackSceneRenderContext) => ReactNode;
  /**
   * Renderer called when the stack has no entries.
   * Returns a `ReactNode` to display in the empty viewport.
   */
  renderEmpty?: () => ReactNode;
  /**
   * Controls which entries are kept mounted in the DOM.
   * @default 'active-only'
   */
  mountStrategy?: NavigationMountStrategy;
  /**
   * Controls whether scenes are clipped at the viewport boundary during transitions.
   * @default 'clip'
   */
  overflowBehavior?: NavigationOverflowBehavior;
  /**
   * Controls how `z-index` is assigned to scene containers.
   * @default 'auto'
   */
  zIndexStrategy?: NavigationZIndexStrategy;
  /**
   * Controls whether transitions are simplified or skipped for users who prefer
   * reduced motion. Also drives the `isReducedMotion` value in `useNavigationTransitions`.
   * @default 'system'
   */
  reducedMotion?: NavigationReducedMotionPreference;
  /**
   * When `true`, focuses the first focusable element in the incoming scene after
   * each navigation action. Set to `false` to manage focus manually.
   * @default true
   */
  autoFocus?: boolean;
  /**
   * When `true`, returns focus to the viewport container when going back (pop actions).
   * Only takes effect when `autoFocus` is `true`.
   */
  restoreFocusOnBack?: boolean;
  /** ARIA label for the viewport container element. */
  ariaLabel?: string;
  /**
   * ARIA live region mode. Set to `'polite'` to have screen readers announce
   * the incoming scene name on each navigation.
   * @default 'off'
   */
  ariaLiveMode?: NavigationAriaLiveMode;
  /** Additional CSS class name applied to the viewport container. */
  className?: string;
  /** Inline styles applied to the viewport container. */
  style?: CSSProperties;
  /** Called when a transition animation begins. */
  onTransitionStart?: (context: NavigationTransitionLifecycleContext) => void;
  /** Called when a transition animation ends. */
  onTransitionEnd?: (context: NavigationTransitionLifecycleContext) => void;
}

function resolvePhase(
  entry: NavigationEntry,
  index: number,
  activeIndex: number,
  transition: NavigationTransitionRuntimeState | null,
): NavigationScenePhase {
  if (transition?.toEntry?.key === entry.key) {
    return 'enter';
  }

  if (transition?.fromEntry?.key === entry.key) {
    return 'exit';
  }

  return index === activeIndex ? 'active' : 'inactive';
}

/**
 * Renders all currently mounted stack scenes inside a `position: relative` container
 * and manages transition animations, focus, and ARIA attributes.
 *
 * Must be rendered inside (or alongside) a `NavigationStackProvider`.
 */
export function NavigationStackViewport(
  props: NavigationStackViewportProps,
): ReactNode {
  const stackContext = useContext(NavigationStackContext);
  const registry = useContext(NavigationStackRegistryContext);

  if (!props.stackId && !stackContext) {
    throw new Error(
      'NavigationStackViewport must be rendered inside NavigationStackProvider.',
    );
  }

  const controller = props.stackId
    ? (registry?.get(props.stackId) ??
      (stackContext?.controller.stackId === props.stackId
        ? stackContext.controller
        : null))
    : stackContext?.controller;

  const routes: NormalizedNavigationRouteRegistry =
    props.stackId && stackContext?.controller.stackId !== props.stackId
      ? ({} as NormalizedNavigationRouteRegistry)
      : (stackContext?.routes ?? ({} as NormalizedNavigationRouteRegistry));

  if (!controller) {
    throw new Error(
      `NavigationStackViewport: no stack found with id "${props.stackId}".`,
    );
  }

  const state = controller.state;
  const activeEntry = controller.activeEntry;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevIsTransitioningRef = useRef(false);
  const activeTransitionRef = useRef<NavigationTransitionRuntimeState | null>(
    null,
  );
  // Latest-ref pattern: these are updated every render so effects that fire
  // on a single dep (activeIndex / isTransitioning) always see the current values
  // without needing them in the dependency array.
  const lastActionRef = useRef(state.lastAction);
  lastActionRef.current = state.lastAction;
  const propsRef = useRef(props);
  propsRef.current = props;
  const stateRef = useRef(state);
  stateRef.current = state;

  const anchor = props.anchor ?? 'left';
  const { orientation: anchorOrientation, direction: anchorDirection } =
    resolveAnchorAnimation(anchor, props.anchorAnimationPolicy);
  const orientation = props.orientation ?? anchorOrientation;
  const reducedMotion = props.reducedMotion ?? 'system';
  const mountStrategy = props.mountStrategy ?? 'active-only';
  const overflowBehavior = props.overflowBehavior ?? 'clip';
  const { stackId } = controller;

  useEffect(() => {
    if (propsRef.current.autoFocus === false) {
      return;
    }

    const isBackward =
      lastActionRef.current?.type === 'pop' ||
      lastActionRef.current?.type === 'popTo' ||
      lastActionRef.current?.type === 'popToRoot';

    if (propsRef.current.restoreFocusOnBack && isBackward) {
      restoreNavigationFocus(containerRef.current);
    } else {
      applyNavigationFocus({
        container: containerRef.current,
        behavior: 'auto',
      });
    }
  }, [state.activeIndex]);

  const renderableEntries = useMemo(() => {
    if (state.entries.length === 0) {
      return [];
    }

    if (mountStrategy === 'keep-alive') {
      return [...state.entries];
    }

    const keys = new Set<string>();

    if (activeEntry) {
      keys.add(activeEntry.key);
    }

    if (state.isTransitioning && state.transition?.fromEntry) {
      keys.add(state.transition.fromEntry.key);
    }

    if (mountStrategy === 'active-plus-previous' && state.activeIndex > 0) {
      const previous = state.entries[state.activeIndex - 1];
      if (previous) {
        keys.add(previous.key);
      }
    }

    return state.entries.filter((entry) => keys.has(entry.key));
  }, [
    activeEntry,
    mountStrategy,
    state.entries,
    state.isTransitioning,
    state.transition,
    state.activeIndex,
  ]);

  useEffect(() => {
    const wasTransitioning = prevIsTransitioningRef.current;
    prevIsTransitioningRef.current = stateRef.current.isTransitioning;

    if (
      stateRef.current.isTransitioning &&
      !wasTransitioning &&
      stateRef.current.transition
    ) {
      activeTransitionRef.current = stateRef.current.transition;
      propsRef.current.onTransitionStart?.({
        stackId,
        transition: stateRef.current.transition,
        state: stateRef.current,
      });
    } else if (
      !stateRef.current.isTransitioning &&
      wasTransitioning &&
      activeTransitionRef.current
    ) {
      const transition = activeTransitionRef.current;
      activeTransitionRef.current = null;
      propsRef.current.onTransitionEnd?.({
        stackId,
        transition,
        state: stateRef.current,
      });
    }
  }, [state.isTransitioning, stackId]);

  const viewportContextValue = useMemo(
    () => ({
      anchor,
      direction: anchorDirection,
      orientation,
      reducedMotion,
      transition: state.transition,
    }),
    [anchor, anchorDirection, orientation, reducedMotion, state.transition],
  );

  // ── Dynamic keyframe CSS ───────────────────────────────────────────────────────────
  // For each scene that is entering or exiting, generate a deterministic @keyframes
  // block from the spec's translate/opacity/scale fields. CSS blocks with identical
  // names are deduplicated so the same animation configuration is only injected once.
  const { dynamicCss, sceneAnimations } = useMemo(() => {
    const empty = {
      dynamicCss: '',
      sceneAnimations: new Map<
        string,
        {
          name: string | undefined;
          delay: number;
          easing: string;
          clip: boolean;
        }
      >(),
    };

    if (!state.isTransitioning || !state.transition) {
      return empty;
    }

    const transition = state.transition;
    const { spec, direction } = transition;
    const seenKeyframes = new Set<string>();
    const cssBlocks: string[] = [];
    const animations = new Map<
      string,
      { name: string | undefined; delay: number; easing: string; clip: boolean }
    >();

    renderableEntries.forEach((entry) => {
      const entryIndex = state.entries.findIndex((e) => e.key === entry.key);
      const phase = resolvePhase(
        entry,
        entryIndex,
        state.activeIndex,
        transition,
      );

      if (phase !== 'enter' && phase !== 'exit') {
        return;
      }

      const keyframeResult = buildAnimationKeyframes(
        spec,
        phase,
        direction,
        entryIndex,
      );
      const curve =
        phase === 'enter'
          ? (spec.enterCurve ?? spec.easing)
          : (spec.exitCurve ?? spec.easing);
      const easing = resolveEasingCSS(curve);

      if (keyframeResult) {
        if (!seenKeyframes.has(keyframeResult.name)) {
          seenKeyframes.add(keyframeResult.name);
          cssBlocks.push(keyframeResult.css);
        }
        animations.set(entry.key, {
          name: keyframeResult.name,
          delay: keyframeResult.delay,
          easing,
          clip: !!spec.clip,
        });
      } else {
        animations.set(entry.key, {
          name: undefined,
          delay: 0,
          easing,
          clip: !!spec.clip,
        });
      }
    });

    return { dynamicCss: cssBlocks.join('\n'), sceneAnimations: animations };
    // renderableEntries identity changes when entries/transition change; state.entries
    // is included for the findIndex lookup inside the memo.
  }, [
    state.isTransitioning,
    state.transition,
    renderableEntries,
    state.entries,
    state.activeIndex,
  ]);

  const ariaAttrs = getNavigationViewportAriaAttributes(
    props.ariaLabel,
    props.ariaLiveMode,
  );

  // Clip the viewport during transitions that require it (e.g. slides), and always
  // when the consumer has set overflowBehavior='clip'.
  const overflowStyle =
    (state.isTransitioning && state.transition?.spec.clip) ||
    overflowBehavior === 'clip'
      ? 'hidden'
      : 'visible';

  if (renderableEntries.length === 0) {
    return (
      <div
        {...ariaAttrs}
        ref={containerRef}
        className={props.className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: overflowStyle,
          ...props.style,
        }}
      >
        <style>{dynamicCss || undefined}</style>
        {props.renderEmpty?.() ?? null}
      </div>
    );
  }

  return (
    <NavigationViewportContext.Provider value={viewportContextValue}>
      <div
        {...ariaAttrs}
        ref={containerRef}
        className={props.className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: overflowStyle,
          ...props.style,
        }}
      >
        {dynamicCss ? <style>{dynamicCss}</style> : null}

        {renderableEntries.map((entry) => {
          const route = routes[entry.routeName];

          if (!route) {
            return null;
          }

          const index = state.entries.findIndex(
            (candidate) => candidate.key === entry.key,
          );
          const isRoot = index === 0;
          const isActive = index === state.activeIndex;
          const phase = resolvePhase(
            entry,
            index,
            state.activeIndex,
            state.transition,
          );
          const renderContext: NavigationStackSceneRenderContext = {
            entry,
            index,
            isActive,
            isRoot,
            phase,
            transitionState: state.transition,
          };

          const content = props.renderScene
            ? props.renderScene(renderContext)
            : createElement(route.component, {
                entry,
                params: entry.params,
                isActive,
                isRoot,
                index,
              });

          const anim = sceneAnimations.get(entry.key);

          return (
            <NavigationStackScene
              key={entry.key}
              entry={entry}
              index={index}
              isActive={isActive}
              isRoot={isRoot}
              phase={phase}
              transitionState={state.transition}
              zIndexStrategy={props.zIndexStrategy}
              animationName={anim?.name}
              animationEasing={anim?.easing}
              animationDelay={anim?.delay}
              clipContent={anim?.clip}
            >
              {isActive || state.isTransitioning ? (
                content
              ) : (
                <div {...getInactiveSceneAriaAttributes()}>{content}</div>
              )}
            </NavigationStackScene>
          );
        })}
      </div>
    </NavigationViewportContext.Provider>
  );
}

import {
  createElement,
  type CSSProperties,
  type ReactElement,
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

export interface NavigationStackSceneRenderContext {
  entry: NavigationEntry;
  index: number;
  isActive: boolean;
  isRoot: boolean;
  phase: NavigationScenePhase;
  transitionState: NavigationTransitionRuntimeState | null;
}

export interface NavigationStackViewportProps {
  stackId?: NavigationStackId;
  anchor?: NavigationAnchor;
  orientation?: NavigationOrientation;
  anchorAnimationPolicy?: NavigationAnchorAnimationPolicy;
  renderScene?: (scene: NavigationStackSceneRenderContext) => ReactNode;
  renderEmpty?: () => ReactNode;
  mountStrategy?: NavigationMountStrategy;
  overflowBehavior?: NavigationOverflowBehavior;
  zIndexStrategy?: NavigationZIndexStrategy;
  reducedMotion?: NavigationReducedMotionPreference;
  autoFocus?: boolean;
  restoreFocusOnBack?: boolean;
  ariaLabel?: string;
  ariaLiveMode?: NavigationAriaLiveMode;
  className?: string;
  style?: CSSProperties;
  onTransitionStart?: (context: NavigationTransitionLifecycleContext) => void;
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

export function NavigationStackViewport(
  props: NavigationStackViewportProps,
): ReactElement | null {
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

  const anchor = props.anchor ?? 'left';
  const { orientation: anchorOrientation, direction: anchorDirection } =
    resolveAnchorAnimation(anchor, props.anchorAnimationPolicy);
  const orientation = props.orientation ?? anchorOrientation;
  const reducedMotion = props.reducedMotion ?? 'system';
  const mountStrategy = props.mountStrategy ?? 'active-only';
  const overflowBehavior = props.overflowBehavior ?? 'clip';

  useEffect(() => {
    if (props.autoFocus === false) {
      return;
    }

    const isBackward =
      state.lastAction?.type === 'pop' ||
      state.lastAction?.type === 'popTo' ||
      state.lastAction?.type === 'popToRoot';

    if (props.restoreFocusOnBack && isBackward) {
      restoreNavigationFocus(containerRef.current);
    } else {
      applyNavigationFocus({
        container: containerRef.current,
        behavior: 'auto',
      });
    }
    // state.lastAction is intentionally omitted: focus should only re-run on activeIndex change
  }, [props.autoFocus, props.restoreFocusOnBack, state.activeIndex]);

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
    prevIsTransitioningRef.current = state.isTransitioning;

    if (state.isTransitioning && !wasTransitioning && state.transition) {
      activeTransitionRef.current = state.transition;
      props.onTransitionStart?.({
        stackId: controller.stackId,
        transition: state.transition,
        state,
      });
    } else if (
      !state.isTransitioning &&
      wasTransitioning &&
      activeTransitionRef.current
    ) {
      const transition = activeTransitionRef.current;
      activeTransitionRef.current = null;
      props.onTransitionEnd?.({
        stackId: controller.stackId,
        transition,
        state,
      });
    }
  }, [state.isTransitioning]);

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

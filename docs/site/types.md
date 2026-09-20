---
layout: page
title: Type reference
---

# Type reference

All types are exported from the package root (`import type { ... } from 'flow-stack'`). Component and hook prop/result types are covered on their own guide pages; this page documents the rest field-by-field.

## Identifiers and shared values

- **`NavigationRouteName`** — `string`. The name of a route.
- **`NavigationEntryKey`** — `string`. Unique key for one stack entry instance.
- **`NavigationRouteId`** — `string`. Optional dedupe/identity ID produced by a route's `getId`.
- **`NavigationStackId`** — `string`. Identifier for a `NavigationStackProvider` instance.
- **`NavigationParams`** — `Record<string, unknown>`. Generic route parameters.
- **`NavigationMeta`** — `Record<string, unknown>`. Arbitrary metadata on a route or entry.

## Behavior enums (string unions)

- **`NavigationAnchor`** — `'left' | 'right' | 'top' | 'bottom' | 'center' | 'auto'`. Viewport edge scenes slide from; `'auto'` defers to `anchorAnimationPolicy`.
- **`NavigationOrientation`** — `'horizontal' | 'vertical' | 'auto'`. Scroll axis of the transition; `'auto'` is resolved from `anchor`.
- **`NavigationPresentation`** — `'stack' | 'replace' | 'overlay'`. How a new entry is presented relative to the stack.
- **`NavigationDirection`** — `'forward' | 'backward' | 'neutral' | 'auto'`. Conceptual direction of a transition.
- **`NavigationMountStrategy`** — `'active-only' | 'active-plus-previous' | 'keep-alive'`. Which entries the viewport keeps mounted. See [Viewport]({{ site.baseurl }}/viewport/).
- **`NavigationOverflowBehavior`** — `'clip' | 'visible'`. Whether content is clipped at the viewport boundary during transitions.
- **`NavigationZIndexStrategy`** — `'auto' | 'explicit'`. How `z-index` is assigned to scenes.
- **`NavigationReducedMotionPreference`** — `'system' | 'always' | 'never'`. See [Accessibility]({{ site.baseurl }}/accessibility/).
- **`NavigationAnchorAnimationPolicy`** — `'follow-anchor' | 'invert-anchor' | 'fixed-forward' | 'fixed-backward' | 'fade-only'`. How direction/orientation are derived from `anchor`.
- **`NavigationFocusBehavior`** — `'auto' | 'preserve' | 'reset'`. Where keyboard focus moves after a navigation action.
- **`NavigationScrollBehavior`** — `'preserve' | 'reset-top'`. Scroll position handling after a navigation action.
- **`NavigationInterruptPolicy`** — `'queue' | 'cancel-current' | 'ignore'`. How a concurrent action is handled when one is already in progress.
- **`NavigationScenePhase`** — `'enter' | 'active' | 'exit' | 'inactive'`. Lifecycle phase of a scene in the viewport.
- **`NavigationEntryState`** — `'entering' | 'active' | 'exiting' | 'inactive'`. Animation/visibility state of a stack entry.
- **`NavigationCachePolicy`** — `'unmount' | 'keep-mounted' | 'keep-warm'`. Cache behavior for a route's component instance.
- **`NavigationAriaLiveMode`** — `'off' | 'polite'`. ARIA live region mode for the viewport.
- **`NavigationTransitionPresetName`** — `'slide-inline' | 'slide-opposite' | 'slide-up' | 'slide-down' | 'fade' | 'fade-scale' | 'none'`. Built-in named transition presets.
- **`NavigationTransitionAxis`** — `'x' | 'y'`. CSS transform axis for a translate transition.
- **`NavigationTransitionCurveToken`** — `'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring'`, or any other CSS `animation-timing-function` string. `'spring'` resolves to a damped-harmonic `linear()` easing function.

## Actions

Dispatched via `controller.dispatch`, or through the typed helper methods on [`NavigationStackController`](#controller).

- **`NavigationPushAction`** — `{ type: 'push', route, params?, options? }`. Pushes a new entry.
- **`NavigationReplaceAction`** — `{ type: 'replace', route, params?, options? }`. Replaces the active entry.
- **`NavigationPopAction`** — `{ type: 'pop', count?, options? }`. Pops `count` entries (default `1`).
- **`NavigationPopToRootAction`** — `{ type: 'popToRoot', options? }`. Pops all entries above the root.
- **`NavigationPopToAction`** — `{ type: 'popTo', matcher, options? }`. Pops until the matched entry is reached. See [`NavigationEntryMatcher`](#entries-and-state).
- **`NavigationResetAction`** — `{ type: 'reset', entries, options? }`. Replaces the whole stack; the last entry becomes active.
- **`NavigationSetParamsAction`** — `{ type: 'setParams', params, options? }`. Shallow-merges params into the active entry.
- **`NavigationUpdateEntryAction`** — `{ type: 'updateEntry', entryKey, updater, options? }`. Applies a pure updater function to a specific entry.
- **`NavigationPreloadAction`** — `{ type: 'preload', route, params?, options? }`. Hints the stack to prepare a route ahead of navigation.
- **`NavigationAction`** — union of all nine action types above.
- **`NavigationActionOptions`** — per-action overrides accepted by every action and every controller method:
  - `transition` — override the transition for this action.
  - `direction` — override the animation direction.
  - `reason` — free-text string describing why the action was dispatched.
  - `replaceIfSame` — for `push` only: replace instead of duplicating if the target route is already active.
  - `focusBehavior` — override focus handling for this action.
  - `scrollBehavior` — override scroll-reset handling for this action.
  - `interruptPolicy` — override how this action behaves when another transition is in progress.

## Entries and state

- **`NavigationEntry`** — one stack entry: `key`, `routeName`, `params`, optional `id` and `meta`, `createdAt` (timestamp), `state` (`NavigationEntryState`).
- **`NavigationStackState`** — a full stack snapshot: `entries`, `activeIndex`, `isTransitioning`, `lastAction`, `transition` (`NavigationTransitionRuntimeState | null`).
- **`NavigationEntryMatcher`** — discriminated union used by `popTo` and `getEntry`: `{ type: 'routeName', value }`, `{ type: 'entryKey', value }`, `{ type: 'id', value }`, or `{ type: 'predicate', value: (entry, index, entries) => boolean }`. See [Guards and matchers]({{ site.baseurl }}/guards-and-matchers/).
- **`NavigationEntryInput`** — a lightweight entry descriptor (`name`, `params?`, `meta?`) used to build or `reset` a stack.

## Transitions

- **`NavigationTransitionSpec`** — full animation specification; every field is optional and falls back to preset defaults:
  - `preset` — a built-in preset to base the spec on.
  - `duration` — total duration in milliseconds.
  - `easing` — default easing for enter and exit; a `NavigationTransitionCurveToken` or a custom `(progress) => number` function.
  - `enterCurve` / `exitCurve` — phase-specific easing overrides.
  - `stagger` — per-scene-index delay (ms), for a staggered multi-scene effect.
  - `opacity` / `translate` / `scale` — `NavigationTransitionOpacityConfig` / `NavigationTransitionTranslateConfig` / `NavigationTransitionScaleConfig`, each a `{ from?, to? }` (translate also has `axis`).
  - `clip` — apply `overflow: hidden` to each scene during the transition.
  - `reverseOnBack` — invert the translate direction for backward navigation.
  - `reducedMotionPreset` — alternative spec or preset name used when reduced motion is active; falls back to `{ ...spec, duration: 0 }`.
- **`NavigationTransitionResolver`** — `(context: NavigationTransitionResolverContext) => NavigationTransitionSpec | NavigationTransitionPresetName | undefined`. Returning `undefined` defers to the route- or stack-level transition.
- **`NavigationTransitionResolverContext`** — `stackId`, `actionType`, `direction`, `fromEntry`, `toEntry`, `depth`, `anchor`, `orientation`, `presentation`, `reducedMotion`, `lastAction`.
- **`NavigationTransitionRuntimeState`** — live state of an in-progress transition: `id`, `actionType`, `direction`, `anchor`, `orientation`, `phase`, `progress` (`0`–`1`), `fromEntry`, `toEntry`, `spec` (the resolved `NavigationTransitionSpec`), `startedAt`.

## Routes and guards

- **`NavigationRouteRef`** — `{ name, params? }`. References a route as an initial or target destination.
- **`NavigationRouteDefinition`** — full route configuration: `name`, `component`, optional `getId`, `title` (string or a function of params), `defaultParams`, `presentation`, `transition`, `canEnter`, `canLeave`, `cachePolicy`, `meta`.
- **`NavigationRouteRegistry`** — the set of routes a provider knows about: either an array or a record of `NavigationRouteDefinition`, keyed by route name in the record form.
- **`NavigationRouteKeyResolver`** — custom function for generating entry keys, in place of the built-in monotonic strategy.
- **`NavigationScreenComponent`** — a React component type that accepts `NavigationScreenRenderProps` as its props.
- **`NavigationScreenRenderProps`** — props passed to a rendered screen: `entry`, `params`, `isActive`, `isRoot`, `index`.
- **`NavigationGuardContext`** — passed to `canEnter`/`canLeave`: `stackId`, `currentState`, `nextState?`, `currentEntry`, `nextEntry?`, `params`, `action`.
- **`NavigationGuardResult`** — `boolean | Promise<boolean>`; `false` (or a promise resolving to `false`) blocks the action.
- **`NavigationEnterGuard`** / **`NavigationLeaveGuard`** — `(context: NavigationGuardContext) => NavigationGuardResult`.

## Callback contexts

Payload shapes for the `NavigationStackProvider` lifecycle callbacks described in [Provider]({{ site.baseurl }}/provider/):

- **`NavigationBeforeActionContext`** — `{ action, state }`, passed to `onBeforeAction`.
- **`NavigationBlockedActionContext`** — `{ action, state, reason }`, passed to `onBlockedAction`.
- **`NavigationActionContext`** — `{ action, nextState }`, passed to `onAction`.
- **`NavigationActiveEntryChangeContext`** — `{ entry }`, passed to `onActiveEntryChange`.
- **`NavigationTransitionLifecycleContext`** — `{ stackId, transition, state }`, passed to `onTransitionStart` / `onTransitionEnd`.

## Component props

Documented in full on their own pages: `NavigationStackProviderProps` (uncontrolled/controlled union) and lifecycle callbacks in [Provider]({{ site.baseurl }}/provider/); `NavigationStackViewportProps` and `NavigationStackSceneRenderContext` in [Viewport]({{ site.baseurl }}/viewport/). `NavigationStackScreenProps` mirrors `NavigationRouteDefinition`. `NavigationStackSceneProps` is the prop shape a custom `renderScene` receives when rendering the default scene container.

## Controller

- **`NavigationStackController`** — returned by `useNavigationStack` and `createNavigationStackController`:
  - Read-only state: `stackId`, `state`, `entries`, `activeEntry`, `depth`, `canGoBack`.
  - `dispatch(action)` — dispatch a raw `NavigationAction` directly.
  - `push`, `replace`, `pop`, `popToRoot`, `popTo`, `reset`, `setParams`, `updateEntry`, `preload` — typed helpers, each accepting trailing `NavigationActionOptions`.
  - `getEntry(matcher)` — returns the first matching entry, or `null`.
- **`CreateNavigationStackControllerOptions`** — options for `createNavigationStackController`: `id`, `routes`, `initialEntries?`, `initialRoute?`, `initialParams?`, `maxDepth?`, `routeKeyResolver?`.

[Back to home]({{ site.baseurl }}/)

---
layout: default
title: React and callbacks
parent: Type reference
grand_parent: Reference
nav_order: 5
permalink: /types/react-and-callbacks/
---

These contracts define component props, hook results, and lifecycle callback payloads.

{% include page-toc.md %}

## Provider props

`NavigationStackProviderProps` is a union of controlled and uncontrolled forms sharing `NavigationStackProviderBaseProps`.

The base requires `id` and accepts `routes`, `maxDepth`, `transition`, `reducedMotion`, `routeKeyResolver`, lifecycle callbacks, and children.

| Mode         | Required                              | Excluded                                          |
| ------------ | ------------------------------------- | ------------------------------------------------- |
| Uncontrolled | Initial entries or route are optional | `state`, `onStateChange`                          |
| Controlled   | `state`, `onStateChange`              | `initialRoute`, `initialParams`, `initialEntries` |

The uncontrolled form may start from `initialEntries`, or from `initialRoute` with `initialParams`.

## Viewport and scene props

`NavigationStackViewportProps` configures stack targeting, anchor and orientation, scene rendering, mount and overflow behavior, reduced motion, focus, ARIA announcements, styling, and transition callbacks. See the [Viewport guide]({{ site.baseurl }}/viewport/) for defaults and behavior.

`NavigationStackSceneRenderContext` contains `entry`, `index`, `isActive`, `isRoot`, `phase`, and `transitionState` for a custom `renderScene` callback.

`NavigationStackSceneProps` adds scene-container details such as `zIndexStrategy`, animation name/easing/delay, clipping, and children. These values are normally supplied by the viewport.

`NavigationStackScreenProps<TRouteName, TParams>` mirrors `NavigationRouteDefinition` for declarative route registration.

## Hook results

`UseNavigationStackResult` extends `NavigationStackController` without adding members.

`UseNavigationEntryResult<TParams>` contains:

| Field       | Type                                                    |
| ----------- | ------------------------------------------------------- |
| `entry`     | `NavigationEntry<NavigationRouteName, TParams> \| null` |
| `routeName` | `NavigationRouteName \| null`                           |
| `params`    | `TParams \| null`                                       |
| `entryKey`  | `NavigationEntryKey \| null`                            |
| `index`     | `number`                                                |
| `isActive`  | `boolean`                                               |
| `isRoot`    | `boolean`                                               |

`UseNavigationTransitionsResult` contains the current `phase`, numeric `progress`, `direction`, `fromEntry`, `toEntry`, viewport `anchor`, `isReducedMotion`, and full `transition`. Nullable fields are `null` while no matching transition or viewport value exists.

## Callback contexts

| Type                                   | Payload                             | Used by                                    |
| -------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `NavigationBeforeActionContext`        | `action`, current `state`           | `onBeforeAction`                           |
| `NavigationBlockedActionContext`       | `action`, current `state`, `reason` | `onBlockedAction`                          |
| `NavigationActionContext`              | `action`, `nextState`               | `onAction`                                 |
| `NavigationActiveEntryChangeContext`   | `entry` or `null`                   | `onActiveEntryChange`                      |
| `NavigationTransitionLifecycleContext` | `stackId`, `transition`, `state`    | Provider and viewport transition callbacks |

`onDepthChange` receives the new depth directly rather than a context object.

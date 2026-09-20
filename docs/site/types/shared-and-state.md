---
layout: default
title: Shared values and state
parent: Type reference
grand_parent: Reference
nav_order: 1
permalink: /types/shared-and-state/
---

These types identify stacks and routes, configure common behavior, and represent stack snapshots.

{% include page-toc.md %}

## Identifiers and records

| Type                  | Declaration               | Purpose                                                  |
| --------------------- | ------------------------- | -------------------------------------------------------- |
| `NavigationRouteName` | `string`                  | Name registered for a route.                             |
| `NavigationEntryKey`  | `string`                  | Unique key for one entry instance.                       |
| `NavigationRouteId`   | `string`                  | Optional logical identity produced by a route’s `getId`. |
| `NavigationStackId`   | `string`                  | Identifier for one provider or controller.               |
| `NavigationParams`    | `Record<string, unknown>` | Default route-parameter shape.                           |
| `NavigationMeta`      | `Record<string, unknown>` | Arbitrary route or entry metadata.                       |

## Behavior values

| Type                                | Values                                                                           | Used by                                     |
| ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `NavigationAnchor`                  | `left`, `right`, `top`, `bottom`, `center`, `auto`                               | Viewport placement and animation direction. |
| `NavigationOrientation`             | `horizontal`, `vertical`, `auto`                                                 | Transition axis.                            |
| `NavigationPresentation`            | `stack`, `replace`, `overlay`                                                    | Route presentation.                         |
| `NavigationDirection`               | `forward`, `backward`, `neutral`, `auto`                                         | Transition direction.                       |
| `NavigationMountStrategy`           | `active-only`, `active-plus-previous`, `keep-alive`                              | Mounted viewport scenes.                    |
| `NavigationOverflowBehavior`        | `clip`, `visible`                                                                | Viewport clipping.                          |
| `NavigationZIndexStrategy`          | `auto`, `explicit`                                                               | Scene stacking.                             |
| `NavigationReducedMotionPreference` | `system`, `always`, `never`                                                      | Provider and viewport motion behavior.      |
| `NavigationAnchorAnimationPolicy`   | `follow-anchor`, `invert-anchor`, `fixed-forward`, `fixed-backward`, `fade-only` | Anchor-to-animation mapping.                |
| `NavigationFocusBehavior`           | `auto`, `preserve`, `reset`                                                      | Focus after an action.                      |
| `NavigationScrollBehavior`          | `preserve`, `reset-top`                                                          | Scroll after an action.                     |
| `NavigationInterruptPolicy`         | `queue`, `cancel-current`, `ignore`                                              | Concurrent action handling.                 |
| `NavigationScenePhase`              | `enter`, `active`, `exit`, `inactive`                                            | Rendered scene lifecycle.                   |
| `NavigationEntryState`              | `entering`, `active`, `exiting`, `inactive`                                      | Entry visibility and animation state.       |
| `NavigationCachePolicy`             | `unmount`, `keep-mounted`, `keep-warm`                                           | Route component retention.                  |
| `NavigationAriaLiveMode`            | `off`, `polite`                                                                  | Viewport announcements.                     |

See [Viewport]({{ site.baseurl }}/viewport/) and [Accessibility]({{ site.baseurl }}/accessibility/) for the behavior controlled by these values.

## `NavigationEntry`

One visit to a registered route:

| Field       | Type                   | Meaning                               |
| ----------- | ---------------------- | ------------------------------------- |
| `key`       | `NavigationEntryKey`   | Unique identity for this stack entry. |
| `routeName` | `TRouteName`           | Registered route name.                |
| `params`    | `TParams`              | Parameters resolved for this visit.   |
| `id`        | `NavigationRouteId?`   | Optional logical route identity.      |
| `meta`      | `NavigationMeta?`      | Entry metadata.                       |
| `createdAt` | `number`               | Unix timestamp in milliseconds.       |
| `state`     | `NavigationEntryState` | Current animation/visibility state.   |

## `NavigationEntryInput`

A lightweight `{ name, params?, meta? }` descriptor accepted by initial stack configuration and `reset`. Flow Stack resolves it into a full `NavigationEntry`.

## `NavigationStackState`

| Field             | Type                                       | Meaning                          |
| ----------------- | ------------------------------------------ | -------------------------------- |
| `entries`         | `readonly NavigationEntry[]`               | Ordered stack entries.           |
| `activeIndex`     | `number`                                   | Index of the visible entry.      |
| `isTransitioning` | `boolean`                                  | Whether a transition is running. |
| `lastAction`      | `NavigationAction \| null`                 | Most recently dispatched action. |
| `transition`      | `NavigationTransitionRuntimeState \| null` | Active transition details.       |

Treat state snapshots and their `entries` collection as read-only. Use controller methods or controlled-provider updates to change navigation state.

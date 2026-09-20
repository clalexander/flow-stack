---
layout: page
title: Accessibility
---

# Accessibility

## Focus management

The viewport's `autoFocus` (default `true`) focuses the incoming scene after each navigation action. `restoreFocusOnBack` returns focus to the viewport container on pop actions.

Per-action `focusBehavior` (in `NavigationActionOptions`) overrides the default for a single action:

| Value      | Behavior                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| `auto`     | Focuses the first focusable element in the incoming scene, or the container. |
| `reset`    | Focuses the scene container element itself.                                  |
| `preserve` | Leaves focus unchanged.                                                      |

Add `data-navigation-autofocus` to an element inside a screen to make it the preferred focus target.

## Screen reader announcements

The viewport's `ariaLiveMode` controls whether navigation is announced: `off` (default) or `polite`.

## Reduced motion

Reduced motion is controlled independently in two places:

- The **provider's** `reducedMotion` prop shapes the transition spec itself (e.g. skipping duration).
- The **viewport's** `reducedMotion` prop drives the `isReducedMotion` value exposed by `useNavigationTransitions`, for consumers that need to react to it directly.

Both accept `system` (default, follows `prefers-reduced-motion`), `always`, or `never`. Pass the same value to both to keep them in sync.

A transition's `reducedMotionPreset` field can specify an alternative spec or preset to use instead of the default zero-duration fallback.

[Back to home]({{ site.baseurl }}/)

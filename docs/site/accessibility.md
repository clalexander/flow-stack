---
layout: default
title: Accessibility
parent: Guides
nav_order: 3
permalink: /accessibility/
---

Flow Stack provides focus, announcement, and reduced-motion controls while leaving screen semantics to your application.

{% include page-toc.md %}

## Focus management

The viewport's `autoFocus` (default `true`) focuses the incoming scene after each navigation action. `restoreFocusOnBack` returns focus to the viewport container on pop actions.

Add `data-navigation-autofocus` to an element inside a screen to make it the preferred focus target.

Set `autoFocus={false}` when the application owns focus restoration. The `focusBehavior` action option is part of the public type contract but is not currently consumed by the viewport runtime.

## Screen reader announcements

The viewport's `ariaLiveMode` controls whether navigation is announced: `off` (default) or `polite`.

Inactive scenes receive `aria-hidden`. Flow Stack does not infer headings, landmarks, labels, or accessible names inside a screen; each screen remains responsible for its own semantic structure.

## Reduced motion

Reduced motion is controlled independently in two places:

- The **provider's** `reducedMotion` prop shapes the transition spec itself (e.g. skipping duration).
- The **viewport's** `reducedMotion` prop drives the `isReducedMotion` value exposed by `useNavigationTransitions`, for consumers that need to react to it directly.

Both accept `system` (default, follows `prefers-reduced-motion`), `always`, or `never`. Pass the same value to both to keep them in sync.

A transition's `reducedMotionPreset` field can specify an alternative spec or preset to use instead of the default zero-duration fallback.

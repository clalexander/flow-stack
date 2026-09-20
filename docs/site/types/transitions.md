---
layout: default
title: Transitions
parent: Type reference
grand_parent: Reference
nav_order: 4
---

Transition types describe presets, custom animation endpoints, dynamic resolution, and live transition state.

{% include page-toc.md %}

## Presets and primitive values

`NavigationTransitionPresetName` accepts `slide-inline`, `slide-opposite`, `slide-up`, `slide-down`, `fade`, `fade-scale`, or `none`.

`NavigationTransitionAxis` is `x | y`. `NavigationTransitionCurveToken` accepts standard CSS timing names, the built-in `spring` token, or another CSS `animation-timing-function` string.

## Endpoint configuration

| Type                                  | Fields                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| `NavigationTransitionOpacityConfig`   | Optional numeric `from` and `to` values.                        |
| `NavigationTransitionTranslateConfig` | Optional `axis`, plus `from` and `to` as pixels or CSS strings. |
| `NavigationTransitionScaleConfig`     | Optional numeric `from` and `to` scale factors.                 |

## `NavigationTransitionSpec`

Every field is optional. A named `preset` supplies baseline values and explicit fields override that baseline.

| Field                             | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `preset`                          | Built-in preset baseline.                       |
| `duration`                        | Total duration in milliseconds.                 |
| `easing`                          | Shared curve token or custom progress function. |
| `enterCurve` / `exitCurve`        | Phase-specific curve overrides.                 |
| `stagger`                         | Delay in milliseconds per scene index.          |
| `opacity` / `translate` / `scale` | Animation endpoints.                            |
| `clip`                            | Clip each scene during animation.               |
| `reverseOnBack`                   | Reverse translation for backward navigation.    |
| `reducedMotionPreset`             | Alternative preset or spec for reduced motion.  |

Without `reducedMotionPreset`, reduced motion falls back to the resolved spec with a zero duration.

## Dynamic resolution

`NavigationTransitionResolver` receives `NavigationTransitionResolverContext` and returns a spec, preset name, or `undefined` to defer to route- or stack-level configuration.

The context contains `stackId`, `actionType`, resolved `direction`, `fromEntry`, `toEntry`, stack `depth`, `anchor`, `orientation`, `presentation`, effective `reducedMotion`, and `lastAction`.

## Runtime state

`NavigationTransitionRuntimeState` describes an active transition with its `id`, action type, direction, anchor, orientation, phase, progress from `0` to `1`, leaving and entering entries, resolved `spec`, and `startedAt` timestamp.

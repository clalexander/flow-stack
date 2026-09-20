---
layout: default
title: Core concepts
parent: Get started
nav_order: 3
permalink: /concepts/
---

Flow Stack separates navigation state from scene rendering so each stack can live wherever your interface needs it.

{% include page-toc.md %}

## Building blocks

| Concept              | Description                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Provider**         | Owns the stack state. One per independent navigation context.                                                         |
| **Screen**           | Declares a named route and its component.                                                                             |
| **Viewport**         | Renders the visible scenes and runs transitions. Separate from the provider so you can position it freely.            |
| **Scene**            | Individual scene container rendered by the viewport. Exposed for custom `renderScene` implementations.                |
| **Controller**       | The headless state machine. The provider wraps one internally; you can also create one directly.                      |
| `useNavigationStack` | Hook that gives any component inside the provider access to `push`, `pop`, `replace`, `reset`, and the current state. |

## Transition resolution order

Transitions are resolved in priority order: **action options → route-level transition → stack-level transition → built-in fallback**. Timing fields (`duration`, `easing`, `enterCurve`, `exitCurve`, `stagger`) and style fields (`preset`, `translate`, `opacity`, `scale`) are merged independently, so you can mix a string preset at the route level with a custom duration at the stack level.

## Multiple independent stacks

Mount as many `NavigationStackProvider` instances as you need — each is fully isolated and identified by its `id`. When more than one stack is mounted, `useNavigationStack(stackId)` and `<NavigationStackViewport stackId="...">` target a specific stack instead of the nearest provider.

Next: [Provider guide]({{ site.baseurl }}/provider/) · [Viewport guide]({{ site.baseurl }}/viewport/)

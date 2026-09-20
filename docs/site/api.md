---
layout: default
title: API summary
parent: Reference
nav_order: 1
permalink: /api/
---

Use this page to choose the runtime API you need. The [type reference]({{ site.baseurl }}/types/) documents the exported TypeScript contracts behind each API.

{% include page-toc.md %}

## Components

| Name                                                                       | Purpose                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`NavigationStackProvider`]({{ site.baseurl }}/provider/)                  | Stack state, route registry, transition resolution                              |
| [`NavigationStackViewport`]({{ site.baseurl }}/viewport/)                  | Scene renderer and animator                                                     |
| [`NavigationStackScreen`]({{ site.baseurl }}/provider/#registering-routes) | Declarative route definition (child of provider)                                |
| `NavigationStackScene`                                                     | Scene container element; used when implementing a custom `renderScene` callback |

## Hooks

| Name                       | Returns                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `useNavigationStack`       | Full controller — `push`, `pop`, `replace`, `reset`, `setParams`, `state`, and more   |
| `useNavigationEntry`       | Active entry snapshot — `entry`, `routeName`, `params`, `entryKey`, `index`, `isRoot` |
| `useNavigationTransitions` | Live transition state — `phase`, `direction`, `anchor`, `isReducedMotion`             |

## Headless

| Name                              | Purpose                                     |
| --------------------------------- | ------------------------------------------- |
| `createNavigationStackController` | Framework-independent navigation controller |

The controller has the same navigation methods returned by `useNavigationStack`. Use it when navigation state must exist outside a React tree; use the provider for rendering, guards, transitions, and lifecycle callbacks.

For the full set of exported TypeScript types (actions, transitions, guards, callback contexts, and prop types), see the [type reference]({{ site.baseurl }}/types/).

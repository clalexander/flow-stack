---
layout: page
title: API summary
---

# API summary

## Components

| Name                      | Purpose                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- |
| `NavigationStackProvider` | Stack state, route registry, transition resolution                              |
| `NavigationStackViewport` | Scene renderer and animator                                                     |
| `NavigationStackScreen`   | Declarative route definition (child of provider)                                |
| `NavigationStackScene`    | Scene container element; used when implementing a custom `renderScene` callback |

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

For the full set of exported TypeScript types (actions, transitions, guards, callback contexts, and prop types), see the [type reference]({{ site.baseurl }}/types/).

[Back to home]({{ site.baseurl }}/)

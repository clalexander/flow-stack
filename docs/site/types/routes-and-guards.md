---
layout: default
title: Routes and guards
parent: Type reference
grand_parent: Reference
nav_order: 3
permalink: /types/routes-and-guards/
---

Route types connect names and parameters to screen components. Guard and matcher types control whether and where navigation proceeds.

{% include page-toc.md %}

## Route references and definitions

`NavigationRouteRef<TRouteName, TParams>` is `{ name, params? }`, used for initial and target destinations.

`NavigationRouteDefinition<TRouteName, TParams>` contains:

| Field                   | Required | Purpose                                                 |
| ----------------------- | -------- | ------------------------------------------------------- |
| `name`                  | Yes      | Unique registered route name.                           |
| `component`             | Yes      | `NavigationScreenComponent<TParams>` to render.         |
| `getId`                 | No       | Derives a stable logical ID from params.                |
| `title`                 | No       | Static title or title resolver.                         |
| `defaultParams`         | No       | Values shallow-merged before caller params.             |
| `presentation`          | No       | Route-level presentation behavior.                      |
| `transition`            | No       | Preset, spec, or resolver overriding the stack default. |
| `canEnter` / `canLeave` | No       | Synchronous or asynchronous route guards.               |
| `cachePolicy`           | No       | Component retention strategy.                           |
| `meta`                  | No       | Arbitrary route metadata.                               |

`NavigationRouteRegistry` accepts either a readonly array of route definitions or a readonly record keyed by route name.

## Screen types

`NavigationScreenComponent<TParams>` is a React component receiving `NavigationScreenRenderProps<TParams>` with `entry`, `params`, `isActive`, `isRoot`, and `index`.

## Entry matching

`NavigationEntryMatcher` is a discriminated union used by `popTo` and `getEntry`:

```ts
type NavigationEntryMatcher =
  | { type: 'routeName'; value: NavigationRouteName }
  | { type: 'entryKey'; value: NavigationEntryKey }
  | { type: 'id'; value: NavigationRouteId }
  | { type: 'predicate'; value: (entry, index, entries) => boolean };
```

See [Guards and matchers]({{ site.baseurl }}/guards-and-matchers/) for usage examples.

## Guard contracts

`NavigationEnterGuard` and `NavigationLeaveGuard` receive a `NavigationGuardContext` and return `NavigationGuardResult`, which is `boolean | Promise<boolean>`.

The context includes `stackId`, `currentState`, optional `nextState`, `currentEntry`, optional `nextEntry`, relevant `params`, and the triggering `action`. Returning or resolving to `false` blocks the action.

## Entry keys

`NavigationRouteKeyResolver` receives `stackId`, `routeName`, merged `params`, optional route `id`, and `existingEntries`, then returns a `NavigationEntryKey`. Supply one only when the built-in monotonic key strategy does not meet your identity requirements.

---
layout: default
title: Actions and controller
parent: Type reference
grand_parent: Reference
nav_order: 2
permalink: /types/actions-and-controller/
---

Actions describe state changes. The controller exposes typed methods for dispatching them and reading the current stack.

{% include page-toc.md %}

## `NavigationAction`

`NavigationAction` is the union of every dispatchable action:

| Action type                   | Required data                                | Effect                                                                                            |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `NavigationPushAction`        | `type: 'push'`, `route`                      | Adds a route to the stack.                                                                        |
| `NavigationReplaceAction`     | `type: 'replace'`, `route`                   | Replaces the active entry.                                                                        |
| `NavigationPopAction`         | `type: 'pop'`                                | Removes `count` entries; `count` defaults to `1`.                                                 |
| `NavigationPopToRootAction`   | `type: 'popToRoot'`                          | Returns to the first entry.                                                                       |
| `NavigationPopToAction`       | `type: 'popTo'`, `matcher`                   | Returns to a matched entry.                                                                       |
| `NavigationResetAction`       | `type: 'reset'`, `entries`                   | Replaces the complete stack; the last entry is active.                                            |
| `NavigationSetParamsAction`   | `type: 'setParams'`, `params`                | Shallow-merges active-entry params.                                                               |
| `NavigationUpdateEntryAction` | `type: 'updateEntry'`, `entryKey`, `updater` | Applies a pure entry update.                                                                      |
| `NavigationPreloadAction`     | `type: 'preload'`, `route`                   | Signals route preparation; the default headless controller records it as a no-op extension point. |

Push, replace, and preload actions also accept optional `params`. Every action accepts optional `options`.

## `NavigationActionOptions`

| Field             | Purpose                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `transition`      | Override animation for this action.                               |
| `direction`       | Override inferred direction.                                      |
| `reason`          | Attach an analytics or debugging reason.                          |
| `replaceIfSame`   | Reserved preference for replacing an already-active pushed route. |
| `focusBehavior`   | Reserved per-action focus preference.                             |
| `scrollBehavior`  | Reserved per-action scroll preference.                            |
| `interruptPolicy` | Reserved concurrent-action preference.                            |

The four reserved fields above are exported for the public contract but are not currently consumed by the runtime. Do not rely on them changing behavior in the current release.

## `NavigationStackController`

The controller returned by `useNavigationStack` and `createNavigationStackController` exposes:

| Member                | Type or signature                       |
| --------------------- | --------------------------------------- |
| `stackId`             | `NavigationStackId`                     |
| `state`               | `NavigationStackState`                  |
| `entries`             | `readonly NavigationEntry[]`            |
| `activeEntry`         | `NavigationEntry \| null`               |
| `depth` / `canGoBack` | `number` / `boolean`                    |
| `dispatch`            | `(action: NavigationAction) => void`    |
| `push` / `replace`    | `(route, params?, options?) => void`    |
| `pop`                 | `(count?, options?) => void`            |
| `popToRoot`           | `(options?) => void`                    |
| `popTo`               | `(matcher, options?) => void`           |
| `reset`               | `(entries, options?) => void`           |
| `setParams`           | `(params, options?) => void`            |
| `updateEntry`         | `(entryKey, updater, options?) => void` |
| `preload`             | `(route, params?, options?) => void`    |
| `getEntry`            | `(matcher) => NavigationEntry \| null`  |

Prefer these typed helpers over raw `dispatch` in application code.

## `CreateNavigationStackControllerOptions`

The headless factory requires `id` and `routes`. It also accepts `initialEntries`, or `initialRoute` with optional `initialParams`, plus `maxDepth` and `routeKeyResolver`.

`initialEntries` and `initialRoute` are alternatives. When `initialEntries` is present, `initialParams` is ignored.

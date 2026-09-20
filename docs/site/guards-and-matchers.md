---
layout: page
title: Guards and matchers
---

# Guards and matchers

## Route guards

A route definition may declare `canEnter` and/or `canLeave`. Each receives a `NavigationGuardContext` (current/next state and entry, params, the triggering action) and returns `boolean | Promise<boolean>`. Returning (or resolving to) `false` blocks the navigation.

Blocked actions call the provider's `onBlockedAction` callback with the action, the state at the time, and a `reason` string.

## Entry matchers

`popTo` and `getEntry` accept a `NavigationEntryMatcher`, a discriminated union:

| `type`      | Matches by                                              |
| ----------- | ------------------------------------------------------- |
| `routeName` | The most recent entry with the given route name.        |
| `entryKey`  | The entry's unique stack key.                           |
| `id`        | The entry's optional dedupe/identity ID (`getId`).      |
| `predicate` | A custom `(entry, index, entries) => boolean` function. |

```tsx
nav.popTo({ type: 'routeName', value: 'home' });
```

[Back to home]({{ site.baseurl }}/)

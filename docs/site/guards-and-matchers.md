---
layout: default
title: Guards and matchers
parent: Guides
nav_order: 4
---

Guards decide whether an action may proceed; matchers locate entries already in the stack.

{% include page-toc.md %}

## Route guards

A route definition may declare `canEnter` and/or `canLeave`. Each receives a `NavigationGuardContext` (current/next state and entry, params, the triggering action) and returns `boolean | Promise<boolean>`. Returning (or resolving to) `false` blocks the navigation.

Blocked actions call the provider's `onBlockedAction` callback with the action, the state at the time, and a `reason` string.

```tsx
const editRoute = {
  name: 'edit',
  component: EditScreen,
  canLeave: async () => confirmUnsavedChanges(),
};
```

A guard must return or resolve to `false` to block. A rejected promise is an error and is not converted into a blocked result.

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

Route-name, entry-key, and ID matchers select the most recent matching entry. Use a predicate when matching depends on params or metadata.

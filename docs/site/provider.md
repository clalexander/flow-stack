---
layout: page
title: Provider
---

# Provider

`NavigationStackProvider` owns the stack state for one navigation context.

## Controlled vs. uncontrolled

- **Uncontrolled** (default): the provider manages its own state, starting from `initialRoute` (with optional `initialParams`) or `initialEntries`.
- **Controlled**: pass `state` and `onStateChange` to own the state externally. `initialRoute`, `initialParams`, and `initialEntries` are not accepted in this mode.

```tsx
<NavigationStackProvider id="main" state={state} onStateChange={setState}>
  {/* ... */}
</NavigationStackProvider>
```

## Registering routes

Routes can be declared two ways, and mixed:

- The `routes` prop — an array or a record of `NavigationRouteDefinition`.
- Declarative `<NavigationStackScreen>` children.

## Limiting stack size

`maxDepth` caps the number of entries the stack will hold. Push actions beyond the limit are ignored.

## Lifecycle callbacks

| Callback              | Called                                                    |
| --------------------- | --------------------------------------------------------- |
| `onBeforeAction`      | Before any action is applied. Return `false` to block it. |
| `onAction`            | After an action has been applied.                         |
| `onActiveEntryChange` | Whenever the active entry changes.                        |
| `onDepthChange`       | Whenever the number of entries changes.                   |
| `onTransitionStart`   | When a transition animation begins.                       |
| `onTransitionEnd`     | When a transition animation ends.                         |
| `onBlockedAction`     | When an action is blocked by a guard or `onBeforeAction`. |

See [Guards and matchers]({{ site.baseurl }}/guards-and-matchers/) for how blocking interacts with route guards.

[Back to home]({{ site.baseurl }}/)

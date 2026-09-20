---
layout: default
title: Provider
parent: Guides
nav_order: 1
permalink: /provider/
---

`NavigationStackProvider` owns the stack state for one navigation context.

{% include page-toc.md %}

## Controlled vs. uncontrolled

- **Uncontrolled** (default): the provider manages its own state, starting from `initialRoute` (with optional `initialParams`) or `initialEntries`.
- **Controlled**: pass `state` and `onStateChange` to own the state externally. `initialRoute`, `initialParams`, and `initialEntries` are not accepted in this mode.

```tsx
<NavigationStackProvider id="main" state={state} onStateChange={setState}>
  {/* ... */}
</NavigationStackProvider>
```

Controlled mode requires the owner to store every value passed to `onStateChange` and provide it back through `state`. Initial route props are intentionally unavailable in this mode.

## Registering routes

Routes can be declared two ways, and mixed:

- The `routes` prop — an array or a record of `NavigationRouteDefinition`.
- Declarative `<NavigationStackScreen>` children.

```tsx
<NavigationStackProvider id="account" initialRoute={{ name: 'profile' }}>
  <NavigationStackScreen name="profile" component={ProfileScreen} />
  <NavigationStackScreen name="security" component={SecurityScreen} />
  <NavigationStackViewport />
</NavigationStackProvider>
```

Routes supplied through the prop and declarative children are combined. Route names must be unique within a stack.

## Initial state

Use `initialRoute` with optional `initialParams` for one starting destination, or `initialEntries` to restore a complete stack. If `initialEntries` is present, it takes precedence over `initialRoute` and `initialParams`.

## Limiting stack size

`maxDepth` caps the number of entries the stack will hold. Push actions beyond the limit are ignored.

## Transition defaults

The provider’s `transition` becomes the stack-level default. Routes and individual actions can override it. Its `reducedMotion` setting changes the resolved animation spec; use the same value on the viewport when consumers also read `useNavigationTransitions().isReducedMotion`.

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

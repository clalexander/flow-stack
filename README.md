# flow-stack

Stack-based navigation for React — designed to live inside a container, not own the page.

[![CI](https://github.com/clalexander/flow-stack/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/clalexander/flow-stack/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/flow-stack)](https://www.npmjs.com/package/flow-stack)
[![npm downloads](https://img.shields.io/npm/dm/flow-stack)](https://www.npmjs.com/package/flow-stack)
[![License](https://img.shields.io/github/license/clalexander/flow-stack)](https://github.com/clalexander/flow-stack/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/clalexander/flow-stack)](https://github.com/clalexander/flow-stack/releases)

## What it is

`flow-stack` is a React library for push/pop navigation inside an existing UI container — a sidebar, a sheet, a modal, an expandable panel, or any fixed-size region. It manages the entry stack, animated scene transitions, and route params, while leaving layout, sizing, and the outer shell entirely up to you.

## Why it exists

Most React navigation libraries assume they own the URL or the full viewport. `flow-stack` makes no such assumption. It is headless by default: bring your own container, mount it wherever you need it, and use as many independent stacks on one screen as you like.

## Key features

- **Push / pop / replace / reset** — full navigation action set with direction awareness
- **Param-driven screens** — typed params per route, with optional defaults
- **Route guards** — async `canEnter` / `canLeave` per route; return `false` (or a rejected promise) to block any navigation action
- **Animated transitions** — 8 built-in presets, fully customisable via `translate`, `opacity`, `scale`, `easing`, `enterCurve`, `exitCurve`, `stagger`
- **Priority-aware transition resolution** — stack → route → action, with timing and style merged independently so `duration` set at the stack level survives a string preset at the route level
- **Reduced motion** — `reducedMotion` prop on the provider; respects `prefers-reduced-motion` by default
- **Multiple independent stacks** — mount as many `NavigationStackProvider` instances as you need; each is fully isolated and identified by its `id`
- **Controlled and uncontrolled** — manage state externally or let the library own it
- **Headless controller** — use `createNavigationStackController` outside React for testing or state-machine integration
- **Accessibility** — focus management and ARIA live regions out of the box

## Installation

```bash
npm install flow-stack
```

Requires React and react-dom ≥ 18.

## Quick start

```tsx
import {
  NavigationStackProvider,
  NavigationStackScreen,
  NavigationStackViewport,
  useNavigationStack,
} from 'flow-stack';

function HomeScreen() {
  const nav = useNavigationStack();
  return <button onClick={() => nav.push('details', { id: '1' })}>Open</button>;
}

function DetailsScreen({ params }) {
  const nav = useNavigationStack();
  return (
    <div>
      <p>ID: {params.id}</p>
      <button onClick={() => nav.pop()}>Back</button>
    </div>
  );
}

export function App() {
  return (
    <div style={{ width: 360, height: 600 }}>
      <NavigationStackProvider id="main" initialRoute={{ name: 'home' }}>
        <NavigationStackScreen name="home" component={HomeScreen} />
        <NavigationStackScreen name="details" component={DetailsScreen} />
        <NavigationStackViewport />
      </NavigationStackProvider>
    </div>
  );
}
```

## Core concepts at a glance

| Concept              | Description                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Provider**         | Owns the stack state. One per independent navigation context.                                                         |
| **Screen**           | Declares a named route and its component.                                                                             |
| **Viewport**         | Renders the visible scenes and runs transitions. Separate from the provider so you can position it freely.            |
| **Scene**            | Individual scene container rendered by the viewport. Exposed for custom `renderScene` implementations.                |
| **Controller**       | The headless state machine. The provider wraps one internally; you can also create one directly.                      |
| `useNavigationStack` | Hook that gives any component inside the provider access to `push`, `pop`, `replace`, `reset`, and the current state. |

Transitions are resolved in priority order: **action options → route-level transition → stack-level transition → built-in fallback**. Timing fields (`duration`, `easing`, `enterCurve`, `exitCurve`, `stagger`) and style fields (`preset`, `translate`, `opacity`, `scale`) are merged independently so you can mix a string preset at the route level with a custom duration at the stack level.

## Examples

Examples coming soon. In the meantime, see the [Quick start](#quick-start) above or browse the [source on GitHub](https://github.com/clalexander/flow-stack).

## Docs

Deeper documentation (transitions, controlled mode, accessibility, headless controller) is in progress. Questions and requests are welcome on the [GitHub issues page](https://github.com/clalexander/flow-stack/issues).

## API summary

**Components**

| Name                      | Purpose                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- |
| `NavigationStackProvider` | Stack state, route registry, transition resolution                              |
| `NavigationStackViewport` | Scene renderer and animator                                                     |
| `NavigationStackScreen`   | Declarative route definition (child of provider)                                |
| `NavigationStackScene`    | Scene container element; used when implementing a custom `renderScene` callback |

**Hooks**

| Name                       | Returns                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `useNavigationStack`       | Full controller — `push`, `pop`, `replace`, `reset`, `setParams`, `state`, and more   |
| `useNavigationEntry`       | Active entry snapshot — `entry`, `routeName`, `params`, `entryKey`, `index`, `isRoot` |
| `useNavigationTransitions` | Live transition state — `phase`, `direction`, `anchor`, `isReducedMotion`             |

**Headless**

| Name                              | Purpose                                     |
| --------------------------------- | ------------------------------------------- |
| `createNavigationStackController` | Framework-independent navigation controller |

## Stability

**Pre-release (0.x).** The public API is still evolving. Breaking changes may occur before `1.0.0`. Feedback on the API surface is welcome.

# Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for information on how to contribute to this repository.

# License

This repository is licensed under the [MIT License](./LICENSE).

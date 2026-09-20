---
layout: home
title: Flow Stack
---

Flow Stack is a React library for push/pop navigation inside an existing UI container — a sidebar, a sheet, a modal, an expandable panel, or any fixed-size region.

## Install

```bash
npm install flow-stack
```

## Quick start

```tsx
import {
  NavigationStackProvider,
  NavigationStackScreen,
  NavigationStackViewport,
} from 'flow-stack';

function App() {
  return (
    <NavigationStackProvider id="main" initialRoute={{ name: 'home' }}>
      <NavigationStackScreen name="home" component={HomeScreen} />
      <NavigationStackViewport />
    </NavigationStackProvider>
  );
}
```

## Examples

- [Basic example]({{ site.baseurl }}/basic/)
- [Advanced example]({{ site.baseurl }}/advanced/)

## Source

See the [flow-stack repository](https://github.com/clalexander/flow-stack) for the full README, API reference, and contribution guide.

---
layout: default
title: Quick start
parent: Get started
nav_order: 2
---

Create two screens, register them with a provider, and render the active screen in a viewport.

{% include page-toc.md %}

## Build a stack

```tsx
import {
  NavigationStackProvider,
  NavigationStackScreen,
  NavigationStackViewport,
  useNavigationStack,
} from 'flow-stack';
import type { NavigationParams, NavigationScreenRenderProps } from 'flow-stack';

interface DetailsParams extends NavigationParams {
  id: string;
}

function HomeScreen() {
  const nav = useNavigationStack();
  return <button onClick={() => nav.push('details', { id: '1' })}>Open</button>;
}

function DetailsScreen({ params }: NavigationScreenRenderProps<DetailsParams>) {
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

The wrapper gives the viewport a stable size. Flow Stack fills its container; it does not size or position the surrounding UI.

## What happens

1. The provider creates an independent stack named `main` and activates `home`.
2. Each `NavigationStackScreen` registers a route and its component.
3. The viewport renders the active route at the size of its parent.
4. `useNavigationStack` exposes typed navigation methods to descendant components.

## Next steps

See it running in the [Basic example]({{ site.baseurl }}/basic/), then read [Core concepts]({{ site.baseurl }}/concepts/) for the state and rendering model.

---
layout: page
title: Quick start
---

# Quick start

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

See it running in the [Basic example]({{ site.baseurl }}/basic/).

[Back to home]({{ site.baseurl }}/)

# Advanced Example

This example builds on the basic example and demonstrates a broader set of FlowStack features.

## What it shows

- external controls that navigate the stack from outside the active screen
- route params across multiple screens
- viewport anchor switching between left and right
- route-level transition overrides
- action-level transition overrides
- a global transition resolver
- reduced-motion toggling
- transition and route state debugging with hooks

## Main routes

- `home`
- `category`
- `article`
- `preferences`

## Transition behavior demonstrated

- the viewport uses a default `slide-inline` transition
- the `article` route uses a route-level `fade` transition
- one of the buttons pushes an article with an action-level `fade-scale` override
- `popToRoot()` uses a global `crossfade` override from the transition resolver
- the preferences route uses `slide-up`

## Run

From this folder:

```bash
npm install
npm run dev
```

---
layout: default
title: Viewport
parent: Guides
nav_order: 2
permalink: /viewport/
---

`NavigationStackViewport` renders the visible scenes and runs transitions. It is separate from the provider so it can be positioned anywhere in your layout.

{% include page-toc.md %}

## Container sizing

The viewport uses `width: 100%`, `height: 100%`, and `position: relative`. Give its parent an explicit or otherwise resolved height; Flow Stack deliberately does not size the surrounding layout.

```tsx
<div style={{ width: 360, height: 600 }}>
  <NavigationStackViewport />
</div>
```

## Layout and direction

| Prop                    | Purpose                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `anchor`                | Edge scenes slide in/out from: `left` \| `right` \| `top` \| `bottom` \| `center` \| `auto`.              |
| `orientation`           | Scroll axis of the animation; inferred from `anchor` when omitted.                                        |
| `anchorAnimationPolicy` | How direction/orientation are derived from `anchor` (e.g. `follow-anchor`, `invert-anchor`, `fade-only`). |

## Mounting and clipping

| Prop               | Purpose                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `mountStrategy`    | Which entries stay mounted: `active-only` (default), `active-plus-previous`, or `keep-alive`. |
| `overflowBehavior` | `clip` (default) or `visible`.                                                                |
| `zIndexStrategy`   | `auto` (default) or `explicit`.                                                               |

## Custom rendering

- `renderScene` replaces the default `NavigationStackScene` renderer. It receives a `NavigationStackSceneRenderContext` (`entry`, `index`, `isActive`, `isRoot`, `phase`, `transitionState`) and must return a `ReactNode`.
- `renderEmpty` renders content when the stack has no entries.

The viewport still owns the outer container and scene lifecycle. A custom renderer owns only the content returned for each scene context.

## Focus and announcements

`autoFocus` defaults to `true`. Set `restoreFocusOnBack` to return focus to the viewport container after pop actions, provide `ariaLabel` to name the navigation region, and choose `ariaLiveMode="polite"` when destination changes should be announced.

See [Accessibility]({{ site.baseurl }}/accessibility/) before changing these defaults.

## Multiple stacks

Pass `stackId` to target a specific `NavigationStackProvider` when more than one is mounted.

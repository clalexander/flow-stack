---
layout: page
title: Viewport
---

# Viewport

`NavigationStackViewport` renders the visible scenes and runs transitions. It is separate from the provider so it can be positioned anywhere in your layout.

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

## Multiple stacks

Pass `stackId` to target a specific `NavigationStackProvider` when more than one is mounted.

[Back to home]({{ site.baseurl }}/)

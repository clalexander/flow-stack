---
layout: default
title: Type reference
parent: Reference
nav_order: 2
has_children: true
permalink: /types/
---

All public types are exported from the package root. Import only the contracts your application needs:

```ts
import type { NavigationEntry, NavigationStackController } from 'flow-stack';
```

{% include page-toc.md %}

## Choose a reference

| When you are working with…                                   | Start here                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Entry identity, stack snapshots, or shared behavior values   | [Shared values and state]({{ site.baseurl }}/types/shared-and-state/)      |
| Push/pop commands or the imperative controller               | [Actions and controller]({{ site.baseurl }}/types/actions-and-controller/) |
| Route definitions, entry matching, or navigation guards      | [Routes and guards]({{ site.baseurl }}/types/routes-and-guards/)           |
| Presets, custom animation specs, or transition runtime state | [Transitions]({{ site.baseurl }}/types/transitions/)                       |
| Component props, hook results, or lifecycle callbacks        | [React and callbacks]({{ site.baseurl }}/types/react-and-callbacks/)       |

## Type conventions

Route names, stack IDs, entry keys, and route IDs are string aliases. Route parameters and metadata default to `Record<string, unknown>`, while generic APIs let screens narrow their parameter shape.

Most configuration object types are interfaces. Behavioral choices and action variants are unions, so TypeScript can narrow them from fields such as `type`.

## Runtime API

Types describe the contracts accepted and returned by Flow Stack. For the functions and components that use them, start with the [API overview]({{ site.baseurl }}/api/).

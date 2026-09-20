---
layout: default
title: Installation
parent: Get started
nav_order: 1
permalink: /installation/
---

Add Flow Stack with the package manager used by your React application.

{% include page-toc.md %}

## Install the package

```bash
# pnpm
pnpm install flow-stack

# npm
npm install flow-stack

# yarn
yarn add flow-stack
```

## Compatibility

Requires React and React DOM 18 or 19.

Flow Stack ships ESM, CommonJS, and TypeScript declarations from the same package. It does not require a stylesheet or a provider at your application root.

## Import the API

Runtime values and types are available from the package root:

```ts
import { NavigationStackProvider } from 'flow-stack';
import type { NavigationStackProviderProps } from 'flow-stack';
```

Continue with the [quick start]({{ site.baseurl }}/quick-start/) to render a stack.

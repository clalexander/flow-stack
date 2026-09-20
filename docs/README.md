# Flow Stack Documentation

This is the canonical documentation for the Flow Stack repository. It is written for maintainers and for AI agents working in this codebase.

## Start Here

- [Development](./development/README.md)
- [Continuous integration](./development/ci.md)
- [Release operations](./development/release.md)
- [CI modernization plan](./plans/flow-stack-ci-modernization-plan.md)

Consumer-facing usage and API documentation lives in [`docs/site/`](./site/) and is published to [GitHub Pages](https://clalexander.github.io/flow-stack/). The root [README](../README.md) provides the package overview. The contribution workflow lives in [CONTRIBUTING](../CONTRIBUTING.md).

## For Agents

Before making a non-trivial change:

1. Read this index.
2. Read the relevant document under `development/`.
3. Inspect the workflows, `package.json`, and `release.config.mjs` to confirm current behavior.
4. Treat documentation as design intent and code as implementation truth. If they conflict, report the discrepancy instead of silently changing behavior.

## Documentation Areas

- `development/`: verification, dependency automation, and release operations.
- `plans/`: historical records of completed plans, kept for context rather than as current instructions.
- `site/`: consumer-facing guides and API reference built with the pinned Just the Docs remote theme.

Other areas are added only when they carry real content.

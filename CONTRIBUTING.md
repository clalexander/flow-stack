# Contributing to Flow Stack

Thank you for contributing to Flow Stack.

This document explains how to propose changes, how we work with branches, and what we expect from pull requests.

## Project Goals

Flow Stack is a React library intended to be stable, maintainable, and pleasant to consume. Contributions should support those goals by prioritizing clarity, compatibility, and long-term maintainability over unnecessary complexity.

## Before You Start

Before making a substantial change, please do one of the following:

- Open an issue describing the problem or proposed enhancement.
- Join an existing issue and confirm that the work is still wanted.
- For larger work, discuss the design before implementation.

This helps avoid duplicate effort and reduces the chance of building something that does not align with the package direction.

## Branching Model

This project uses Git Flow with two long-lived branches:

- `main`: production-ready code and tagged releases
- `dev`: active integration branch for upcoming work

In general:

- Start feature work from `dev`
- Open feature pull requests back into `dev`
- Prepare releases from `dev`
- Apply urgent production fixes to `main`, then merge them back into `dev`

## Branch Naming

Use clear, descriptive branch names. Recommended patterns:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`
- `release/<version>`
- `hotfix/<short-description>`

Examples:

- `feature/navigation-transitions`
- `fix/history-stack-bounds`
- `docs/api-readme`
- `release/0.2.0`
- `hotfix/cjs-entrypoint`

## Development Setup

1. Clone the repository.
2. Install dependencies.
3. Create a branch from `dev`.
4. Run the local quality checks before opening a pull request.

Typical commands:

```bash
corepack enable
pnpm install
pnpm run build
pnpm run typecheck
pnpm test
pnpm run lint
pnpm run format:check
```

## Repository Conventions

Please follow these conventions when contributing:

- Keep changes focused and reasonably scoped.
- Prefer small pull requests over very large ones.
- Preserve public API stability unless the change is intentionally breaking.
- Update types, tests, docs, and examples when behavior changes.
- Keep internal code clear and predictable.
- Do not introduce unrelated refactors into a focused pull request.

## Formatting and Linting

We separate formatting from linting:

- Prettier handles formatting.
- ESLint handles code quality and rule-based issues.

Before opening a pull request, run the reporting commands, which are the same ones continuous integration runs:

```bash
pnpm run lint
pnpm run format:check
```

To apply fixes instead of reporting them:

```bash
pnpm run lint:fix
pnpm run format
```

## Tests

All tests should live under `/test` at the repository root.

Contributions should include or update tests when they:

- add behavior
- change behavior
- fix bugs
- affect public APIs
- modify rendering, navigation flow, or state behavior

When fixing a bug, prefer adding a test that fails before the fix and passes after it.

## Documentation

Please update documentation when relevant. This includes:

- `README.md`
- project documentation under [`docs/`](./docs/README.md)
- API documentation
- examples

Release notes are generated from commit subjects, so no manual changelog entry is needed.

A contribution is not complete if users would need new behavior explained and the documentation was left behind.

## Pull Requests

### Target Branch

- Most pull requests should target `dev`.
- Release pull requests follow the release process.
- Hotfix pull requests may target `main` when needed, but the changes must also be merged back into `dev`.

### Pull Request Expectations

A good pull request should:

- use a conventional title, because it becomes the squashed commit subject
- explain what changed
- explain why it changed
- reference any related issue
- describe any breaking behavior
- include tests and documentation updates where appropriate

Please keep pull requests reviewable. If a change is large, break it into smaller steps when possible.

## Commit Guidance

This repository squash merges pull requests, so the pull request title becomes the commit subject on the target branch. Release automation reads those subjects, which makes the title part of the change rather than a label.

Use [Conventional Commits](https://www.conventionalcommits.org/). A title is `type(optional scope): subject`, where the subject starts with a lowercase letter.

Good examples:

- `feat: add stack transition state guards`
- `fix: correct navigation index underflow`
- `docs: document controlled container usage`

Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, and `test`. A pull request title is validated automatically.

Which types publish a release is documented in [release operations](./docs/development/release.md). In short, `feat` produces a minor release, `fix` and `perf` produce a patch, a `BREAKING CHANGE:` footer produces a major, and most other types publish nothing.

## Release Expectations

Releases are automated. When a change merges to `main`, semantic-release determines the version from commit subjects, publishes to npm, writes `CHANGELOG.md`, updates the version in `package.json`, tags the commit, and creates the GitHub release.

Because those artifacts are generated, do not edit the package version or changelog by hand in a pull request.

Work still integrates through `dev` before reaching `main`, and release branches should carry only release preparation and validation. Avoid mixing new feature work into a release branch.

The full release path, including prerequisites, recovery, and rollback, is documented in [release operations](./docs/development/release.md).

## Hotfix Process

For critical production issues:

1. Branch from `main`
2. Implement the fix
3. Open a pull request into `main`
4. After merge, ensure the fix is merged or cherry-picked back into `dev`

This keeps the production branch stable while preventing branch drift.

## Review Standards

Maintainers may ask for changes when a pull request:

- does not align with project architecture
- lacks sufficient tests
- changes public behavior without documentation
- introduces avoidable complexity
- does not follow repository conventions

Review feedback is part of the contribution process and is intended to improve the change, not discourage the contributor.

## Contributor License and Ownership

By contributing to this repository, you confirm that you have the right to submit the work and that the contribution may be distributed under the project license.

## Questions

If anything in this guide is unclear, please open an issue or discussion before investing significant time in implementation.

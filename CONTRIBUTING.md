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
npm install
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
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

Before opening a pull request, run:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
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
- API documentation
- examples
- migration or release notes for notable behavior changes

A contribution is not complete if users would need new behavior explained and the documentation was left behind.

## Pull Requests

### Target Branch

- Most pull requests should target `dev`.
- Release pull requests follow the release process.
- Hotfix pull requests may target `main` when needed, but the changes must also be merged back into `dev`.

### Pull Request Expectations

A good pull request should:

- explain what changed
- explain why it changed
- reference any related issue
- describe any breaking behavior
- include tests and documentation updates where appropriate

Please keep pull requests reviewable. If a change is large, break it into smaller steps when possible.

## Commit Guidance

Write commit messages that are clear and descriptive. A commit should communicate intent, not just activity.

Good examples:

- `Add stack transition state guards`
- `Fix navigation index underflow`
- `Document controlled container usage`

## Release Expectations

Releases are cut from `main`, with work integrated through `dev` first. Release branches should focus on release preparation only, such as:

- version updates
- changelog updates
- final documentation adjustments
- release validation

Avoid mixing new feature work into a release branch.

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

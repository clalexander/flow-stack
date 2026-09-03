# Continuous Integration

Flow Stack has one authoritative verification contract. Pull requests and releases both call the same reusable workflow, so the commit that publishes to npm passes exactly the checks a reviewer saw.

## Workflow Topology

| Workflow                  | Trigger                                                                        | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `ci.yml`                  | Pull requests to `main`, `dev`, `release/**`, `hotfix/**`, and manual dispatch | Thin caller that runs verification for unprivileged changes        |
| `verify.yml`              | `workflow_call` only                                                           | Owns all quality and compatibility checks                          |
| `release.yml`             | Push to `main`, and manual dispatch                                            | Verifies, then publishes or performs an analysis-only dry run      |
| `pr-title.yml`            | `pull_request`                                                                 | Validates conventional pull request titles                         |
| `react-major-support.yml` | Monthly schedule and manual dispatch                                           | Proposes support for a new React major                             |
| `dependency-release.yml`  | `pull_request_target` on closed pull requests                                  | Promotes merged Dependabot groups and cleans up promotion branches |

`ci.yml` skips draft pull requests. Marking a draft ready for review starts verification.

## The Verification Contract

`verify.yml` runs three working jobs and one aggregate:

1. **Prepare compatibility matrix** derives the supported React majors from package metadata.
2. **Quality** installs with a frozen lockfile, audits dependencies, then checks formatting and lint.
3. **Compatibility** runs typecheck, build, and tests across every supported Node and React combination with `fail-fast: false`.
4. **Verification** is the stable aggregate. It runs with `if: always()` and succeeds only when every upstream job succeeded, so a failed, cancelled, or unexpectedly skipped job fails the check.

`Verification` is a naming contract with branch protection. Renaming that job breaks required status checks.

Verification has read-only repository permission, receives no secrets, and never mutates remote state.

## Required Checks

Branch rulesets for `main` and `dev` require:

- `Verification`
- `Validate PR title`

GitHub only offers checks that have reported recently. If either is missing when configuring a ruleset, run the workflows on a pull request first.

## Compatibility Sources

React support is declared once, in `peerDependencies.react` in `package.json`. `react-dom` must carry the same range. The matrix job parses that range, so the supported majors are never duplicated in workflow YAML.

Node majors are explicit in the compatibility matrix because a minimum version in `engines.node` does not imply which majors to test.

The React compatibility watcher checks npm monthly for a newer React major. When one exists, it updates `peerDependencies` and the README compatibility sentence, then opens a pull request to `dev`. It never edits workflow YAML and never changes `devDependencies`, so local development stays on the current baseline while the matrix exercises the candidate.

## Supply-Chain Audits

Quality runs two distinct, fail-closed controls:

- `pnpm audit` reports known vulnerability advisories.
- `npm audit signatures` verifies registry signatures and attestations.

These are separate concerns. Do not merge them or rename one to describe the other.

Transitive advisories that have no direct upgrade path are pinned through `overrides` in `pnpm-workspace.yaml`.

## Dependency Automation

Dependabot targets `dev` and produces at most two routine pull requests:

| Ecosystem        | Group              | Title scope                        | Open PR limit |
| ---------------- | ------------------ | ---------------------------------- | ------------- |
| npm              | `npm-dependencies` | `chore(deps)` or `chore(deps-dev)` | 1             |
| `github-actions` | `github-actions`   | `ci(deps)`                         | 1             |

The npm group keeps Dependabot's own scope. A group containing a production dependency is `chore(deps)` and releases a patch; a development-only group is `chore(deps-dev)` and intentionally releases nothing.

Compatibility holds live in two places and mean different things:

- `.github/dependabot.yml` ignores React majors and specific unsupported version ranges. These entries support version bounds.
- `pnpm-workspace.yaml` lists package names under `update.ignoreDeps`. These entries have no version granularity and apply only to a bare `pnpm update`.

Dependabot reads `.github/dependabot.yml` from the default branch. Changes to grouping take effect only after they land there.

### Promotion To `main`

Merging either grouped pull request into `dev` triggers `dependency-release.yml`, which:

1. verifies the merge commit is contained in `dev` and not already contained in `main`;
2. creates `release/dependencies-<source PR number>` at that exact merge commit;
3. opens a draft pull request to `main` whose title mirrors the source scope.

The promotion branch is a fixed snapshot of `dev` at the merge commit. It contains every commit on `dev` at that point, not only the dependency updates, so review the full diff.

An existing branch at an unexpected commit is a hard failure rather than an overwrite. After the promotion pull request merges, the branch is deleted only when its name matches `release/dependencies-<number>` and its commit still equals the merged head.

Security updates that GitHub cannot fold into a group use per-dependency branches. Those are intentionally not promoted automatically and require a manual promotion pull request.

## Generated Pull Request Identity

Automated pull requests are created with a GitHub App installation token, not the default workflow token, so they trigger normal checks. Tokens are minted immediately before the step that needs them and are never persisted by checkout.

`dependency-release.yml` uses `pull_request_target` because it needs merged-event metadata. It never checks out or executes pull request code, and every untrusted event value is passed through the environment rather than interpolated into a shell command.

## Local Equivalents

Verification mirrors commands available locally. See [the development guide](./README.md) for the gate order and the fix commands.

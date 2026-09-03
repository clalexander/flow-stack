# Release Operations

Flow Stack publishes to public npm with semantic-release. Versioning, changelog entries, tags, and GitHub releases are generated. Do not edit the version in `package.json` or write `CHANGELOG.md` entries by hand.

## Release Model

Releases run from `main`. Work integrates through `dev` first.

Because pull requests are squash merged, the pull request title becomes the commit subject on `main`, and that subject determines the release. A careless title changes what ships.

## Release Classification

| Commit subject                              | Result        |
| ------------------------------------------- | ------------- |
| `feat: ...`                                 | minor release |
| `fix: ...` or `perf: ...`                   | patch release |
| `chore(deps): ...`                          | patch release |
| `chore(deps-dev): ...`                      | no release    |
| `ci: ...` or `test: ...`                    | no release    |
| `chore(release): ...`                       | no release    |
| Any commit with a `BREAKING CHANGE:` footer | major release |

Types such as `docs`, `refactor`, `style`, and `build` do not trigger a release on their own.

## Prerequisites

The release path depends on external configuration that lives outside this repository:

- A GitHub App installed on this repository, exposed as the Actions variable `RELEASE_AUTOMATION_APP_ID` and the secret `RELEASE_AUTOMATION_PRIVATE_KEY`.
- A protected `npm` environment restricted to `main`, with a required reviewer and no environment secrets.
- An npm trusted publisher for this repository, workflow `release.yml`, and environment `npm`.

No long-lived npm token exists. Publication authenticates through GitHub OIDC. If publishing fails, fix the trusted publisher configuration; do not add a token.

Setup steps are recorded in the manual configuration runbook of the [CI modernization plan](../plans/flow-stack-ci-modernization-plan.md).

## The Release Path

1. A pull request merges to `main`.
2. `release.yml` runs the reusable verification workflow. Nothing else starts until `Verification` succeeds.
3. The release job requests the protected `npm` environment and waits for approval.
4. A short-lived App token is minted and passed only to semantic-release, using process-scoped Git authentication.
5. semantic-release analyzes commits and, when a release is warranted, publishes to npm with provenance, commits the version and changelog, creates the tag, and publishes the GitHub release.
6. A back-merge pull request from `main` into `dev` is opened so the release commit returns to the integration branch.

If no commit warrants a release, the run is a successful no-op.

The release commit is `chore(release): <version>`, which is classified as non-releasing, so it cannot cause a second release. It does re-trigger the workflow once; that run verifies and then no-ops.

## Dry Run

Use **Actions → Release → Run workflow** from `main` with `dry-run` enabled.

The dry run is mechanically incapable of publishing. It runs in a separate job with no npm environment, no OIDC permission, and no App credentials, and it points semantic-release at a local bare clone with only the analysis plugins loaded. It reports the version that would be released.

## Back-Merge

The post-release sync pull request opens only when `main` is ahead of `dev`. If an equivalent pull request already exists for the current `main` commit, the step is a no-op. Merge it promptly so `dev` does not drift.

## Hotfixes

1. Branch from `main`.
2. Open a pull request into `main` with a conventional title, usually `fix: ...`.
3. Merge after `Verification` passes and the release publishes.
4. Merge the resulting sync pull request back into `dev`.

## Failure Recovery

| Failure                           | Effect                                       | Action                                                                      |
| --------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| Verification fails                | Nothing is published                         | Fix the code and merge again                                                |
| Advisory or signature audit fails | Release blocked before mutation              | Resolve the advisory or add a reviewed override                             |
| App token creation fails          | No mutation occurs                           | Check App installation, variable, and secret; do not substitute a token     |
| npm OIDC failure                  | Publish fails with no fallback               | Correct the trusted publisher or environment, then re-run                   |
| Publish succeeded, commit failed  | npm has the version, `main` lacks the commit | Do not unpublish. Reconcile the repository, then release a corrective patch |
| Promotion branch moved            | Workflow refuses to overwrite or delete      | Investigate manually; the exact commit is reported in the log               |

## Rollback Policy

Never unpublish a released version as routine rollback. Use one of:

- a corrective patch release, or
- `npm deprecate` with a message pointing at the fixed version.

Unpublishing breaks consumers and lockfiles.

## App Key Rotation

1. Generate a new private key in the App settings.
2. Replace the `RELEASE_AUTOMATION_PRIVATE_KEY` secret.
3. Confirm an automated pull request or a dry run still authenticates.
4. Delete the old key.

Record the owner and rotation date in maintainer records, not in this repository.

## Verifying External Configuration

Non-secret evidence worth confirming after any change to the release path:

- the App's installed repository and permission list;
- the Actions variable and secret names, never their values;
- the `npm` environment branch restriction and reviewer setting;
- the npm trusted publisher repository, workflow, and environment;
- required checks and bypass actors on `main` and `dev`;
- that squash merging is enabled;
- the actor and checks on the most recent generated pull request;
- the provenance attestation on the most recent published version.

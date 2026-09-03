# Development

Operational documentation for building, verifying, and releasing Flow Stack.

## Contents

- [Continuous integration](./ci.md): workflow topology, the required checks, the compatibility matrix, supply-chain audits, and dependency automation.
- [Release operations](./release.md): release classification, prerequisites, the release path, recovery, and rollback.
- [CI modernization plan](./flow-stack-ci-modernization-plan.md): the initiative record describing why the current automation exists.

## Toolchain

- Node: `engines.node` is `>=20.19.0`, and continuous integration verifies Node 20, 22, and 24.
- pnpm: pinned by `packageManager`. Use `corepack enable` rather than installing pnpm globally.
- `pnpm-lock.yaml` is the authoritative lockfile. An ignored `package-lock.json` may exist locally and is not used.

## Local Quality Gates

Run the same checks continuous integration runs, in gate order:

```powershell
pnpm run build
pnpm run typecheck
pnpm test
pnpm run lint
pnpm run format:check
```

To apply fixes rather than report them:

```powershell
pnpm run lint:fix
pnpm run format
```

## Dependency Updates

`pnpm-workspace.yaml` holds compatibility pins through `updateConfig.ignoreDependencies`. That list suppresses packages only during a bare `pnpm update`; naming a package explicitly, such as `pnpm update react`, still updates it. React majors are owned by the React compatibility watcher described in [ci.md](./ci.md).

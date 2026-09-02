import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

import {
  createReactMajorUpdate,
  type ReactSupportPackageJson,
  updateCompatibilityText,
  writeReactSupportFiles,
} from './react-support.ts';

const packageJsonPath = 'package.json';
const readmePath = 'README.md';

function setOutput(name: string, value: string): void {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function getLatestReactVersion(): string {
  return execFileSync('npm', ['view', 'react', 'version'], {
    encoding: 'utf8',
  }).trim();
}

function parsePackageJson(
  value: string,
): ReactSupportPackageJson & Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('package.json must contain a JSON object.');
  }

  return parsed as ReactSupportPackageJson & Record<string, unknown>;
}

const originalPackageJson = readFileSync(packageJsonPath, 'utf8');
const packageJson = parsePackageJson(originalPackageJson);
const latestReactVersion = getLatestReactVersion();
const update = createReactMajorUpdate(packageJson, latestReactVersion);

setOutput('latest-react-version', latestReactVersion);
setOutput('candidate-react-major', String(update.candidateMajor));
setOutput('changed', String(update.changed));

if (!update.changed) {
  console.log(
    `React ${latestReactVersion} is already covered by ${packageJson.peerDependencies?.react}.`,
  );
  process.exit(0);
}

const originalReadme = readFileSync(readmePath, 'utf8');
const updatedPackageJson = `${JSON.stringify(update.packageJson, null, 2)}\n`;
const updatedReadme = updateCompatibilityText(
  originalReadme,
  update.supportedMajors,
);

writeReactSupportFiles(
  [
    {
      original: originalPackageJson,
      path: packageJsonPath,
      updated: updatedPackageJson,
    },
    {
      original: originalReadme,
      path: readmePath,
      updated: updatedReadme,
    },
  ],
  (path, value) => writeFileSync(path, value),
);

console.log(
  `Prepared React ${update.candidateMajor} compatibility candidate using latest React ${latestReactVersion}.`,
);

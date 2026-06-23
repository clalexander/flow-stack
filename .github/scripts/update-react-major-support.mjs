import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';

const packageJsonPath = 'package.json';
const readmePath = 'README.md';
const workflowPaths = [
  '.github/workflows/ci.yml',
  '.github/workflows/release.yml',
];

function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function getLatestReactVersion() {
  return execFileSync('npm', ['view', 'react', 'version'], {
    encoding: 'utf8',
  }).trim();
}

function getMajor(version) {
  const major = Number.parseInt(version.split('.')[0] ?? '', 10);

  if (!Number.isInteger(major)) {
    throw new Error(`Could not parse major version from "${version}".`);
  }

  return major;
}

function getMinimumPeerMajor(peerRange) {
  const match = peerRange.match(/>=\s*(\d+)/);

  if (!match) {
    throw new Error(
      `Could not parse minimum React peer major from "${peerRange}".`,
    );
  }

  return Number.parseInt(match[1], 10);
}

function getMaximumSupportedMajor(peerRange) {
  const match = peerRange.match(/<\s*(\d+)/);

  if (!match) {
    throw new Error(
      `Could not parse upper React peer bound from "${peerRange}".`,
    );
  }

  return Number.parseInt(match[1], 10) - 1;
}

function getMajorRange(minimumMajor, maximumMajor) {
  return Array.from({ length: maximumMajor - minimumMajor + 1 }, (_, index) =>
    String(minimumMajor + index),
  );
}

function formatYamlArray(values) {
  return `[${values.map((value) => `'${value}'`).join(', ')}]`;
}

function formatReadmeCompatibility(values) {
  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} or ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, or ${values.at(-1)}`;
}

function updateWorkflowReactMatrix(path, supportedMajors) {
  if (!existsSync(path)) {
    return;
  }

  const original = readFileSync(path, 'utf8');
  const updated = original.replace(
    /react:\s*\[[^\]]+\]/g,
    `react: ${formatYamlArray(supportedMajors)}`,
  );

  if (updated === original) {
    throw new Error(`Could not find an inline React matrix in ${path}.`);
  }

  writeFileSync(path, updated);
}

function updateReadmeCompatibility(path, supportedMajors) {
  if (!existsSync(path)) {
    return;
  }

  const original = readFileSync(path, 'utf8');
  const compatibility = formatReadmeCompatibility(supportedMajors);
  const updated = original.replace(
    /Requires React and react-dom .+?\./,
    `Requires React and react-dom ${compatibility}.`,
  );

  if (updated !== original) {
    writeFileSync(path, updated);
  }
}

const packageJson = readJson(packageJsonPath);
const latestReactVersion = getLatestReactVersion();
const latestReactMajor = getMajor(latestReactVersion);
const currentReactPeerRange = packageJson.peerDependencies?.react;

if (!currentReactPeerRange) {
  throw new Error('package.json is missing peerDependencies.react.');
}

const minimumSupportedMajor = getMinimumPeerMajor(currentReactPeerRange);
const maximumSupportedMajor = getMaximumSupportedMajor(currentReactPeerRange);

setOutput('latest-react-version', latestReactVersion);
setOutput('latest-react-major', String(latestReactMajor));

if (latestReactMajor <= maximumSupportedMajor) {
  setOutput('changed', 'false');
  setOutput('candidate-react-major', String(maximumSupportedMajor));
  console.log(
    `React ${latestReactVersion} is already covered by ${currentReactPeerRange}.`,
  );
  process.exit(0);
}

const candidateReactMajor = maximumSupportedMajor + 1;
const supportedMajors = getMajorRange(
  minimumSupportedMajor,
  candidateReactMajor,
);
const nextPeerRange = `>=${minimumSupportedMajor} <${candidateReactMajor + 1}`;

packageJson.peerDependencies.react = nextPeerRange;
packageJson.peerDependencies['react-dom'] = nextPeerRange;

writeJson(packageJsonPath, packageJson);

for (const workflowPath of workflowPaths) {
  updateWorkflowReactMatrix(workflowPath, supportedMajors);
}

updateReadmeCompatibility(readmePath, supportedMajors);

setOutput('changed', 'true');
setOutput('candidate-react-major', String(candidateReactMajor));

console.log(
  `Prepared React ${candidateReactMajor} compatibility candidate using latest React ${latestReactVersion}.`,
);

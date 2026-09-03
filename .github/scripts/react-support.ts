export interface ReactSupportPackageJson {
  peerDependencies?: {
    react?: string;
    'react-dom'?: string;
  };
}

export interface ReactMajorUpdate<TPackageJson> {
  candidateMajor: number;
  changed: boolean;
  packageJson: TPackageJson;
  supportedMajors: string[];
}

export interface ReactSupportFileUpdate {
  original: string;
  path: string;
  updated: string;
}

const peerRangePattern = /^>=(\d+) <(\d+)$/;
const compatibilityPattern = /Requires React and React DOM ([^.]+)\./g;

function getMajor(version: string): number {
  const major = /^(\d+)\./.exec(version)?.[1];

  if (major === undefined) {
    throw new Error(`Could not parse React major from "${version}".`);
  }

  return Number.parseInt(major, 10);
}

function parsePeerRange(peerRange: string): {
  exclusiveMaximumMajor: number;
  minimumMajor: number;
} {
  const [, minimum, exclusiveMaximum] = peerRangePattern.exec(peerRange) ?? [];

  if (minimum === undefined || exclusiveMaximum === undefined) {
    throw new Error(
      `Expected a contiguous React peer range like ">=18 <20", received "${peerRange}".`,
    );
  }

  const minimumMajor = Number.parseInt(minimum, 10);
  const exclusiveMaximumMajor = Number.parseInt(exclusiveMaximum, 10);

  if (exclusiveMaximumMajor <= minimumMajor) {
    throw new Error(
      `React peer range "${peerRange}" must include at least one major.`,
    );
  }

  return { exclusiveMaximumMajor, minimumMajor };
}

function getMajorRange(
  minimumMajor: number,
  exclusiveMaximumMajor: number,
): string[] {
  return Array.from(
    { length: exclusiveMaximumMajor - minimumMajor },
    (_, index) => String(minimumMajor + index),
  );
}

function formatCompatibility(majors: string[]): string {
  const [first, ...rest] = majors;

  if (first === undefined) {
    throw new Error('Expected at least one supported React major.');
  }

  const last = rest.pop();

  if (last === undefined) {
    return first;
  }

  return rest.length === 0
    ? `${first} or ${last}`
    : `${[first, ...rest].join(', ')}, or ${last}`;
}

export function getSupportedReactMajors(
  reactRange: string,
  reactDomRange: string,
): string[] {
  if (reactRange !== reactDomRange) {
    throw new Error(
      `React peer ranges must match: react is "${reactRange}" and react-dom is "${reactDomRange}".`,
    );
  }

  const { exclusiveMaximumMajor, minimumMajor } = parsePeerRange(reactRange);

  return getMajorRange(minimumMajor, exclusiveMaximumMajor);
}

export function createReactMajorUpdate<
  TPackageJson extends ReactSupportPackageJson,
>(
  packageJson: TPackageJson,
  latestVersion: string,
): ReactMajorUpdate<TPackageJson> {
  const reactRange = packageJson.peerDependencies?.react;
  const reactDomRange = packageJson.peerDependencies?.['react-dom'];

  if (!reactRange || !reactDomRange) {
    throw new Error(
      'package.json must define react and react-dom peer dependencies.',
    );
  }

  const supportedMajors = getSupportedReactMajors(reactRange, reactDomRange);
  const highestSupportedMajor = supportedMajors[supportedMajors.length - 1];

  if (highestSupportedMajor === undefined) {
    throw new Error('The React peer range produced no supported majors.');
  }

  const maximumSupportedMajor = Number.parseInt(highestSupportedMajor, 10);
  const latestMajor = getMajor(latestVersion);

  if (latestMajor <= maximumSupportedMajor) {
    return {
      candidateMajor: maximumSupportedMajor,
      changed: false,
      packageJson,
      supportedMajors,
    };
  }

  const candidateMajor = maximumSupportedMajor + 1;
  const minimumMajor = supportedMajors[0];
  const nextPeerRange = `>=${minimumMajor} <${candidateMajor + 1}`;
  const updatedPackageJson = structuredClone(packageJson);

  if (!updatedPackageJson.peerDependencies) {
    throw new Error(
      'package.json must define react and react-dom peer dependencies.',
    );
  }

  updatedPackageJson.peerDependencies.react = nextPeerRange;
  updatedPackageJson.peerDependencies['react-dom'] = nextPeerRange;

  return {
    candidateMajor,
    changed: true,
    packageJson: updatedPackageJson,
    supportedMajors: [...supportedMajors, String(candidateMajor)],
  };
}

export function updateCompatibilityText(
  readme: string,
  supportedMajors: string[],
): string {
  const matches = [...readme.matchAll(compatibilityPattern)];

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one React compatibility sentence, found ${matches.length}.`,
    );
  }

  return readme.replace(
    compatibilityPattern,
    `Requires React and React DOM ${formatCompatibility(supportedMajors)}.`,
  );
}

export function writeReactSupportFiles(
  updates: ReactSupportFileUpdate[],
  writeFile: (path: string, value: string) => void,
): void {
  const completedUpdates: ReactSupportFileUpdate[] = [];

  try {
    updates.forEach((update) => {
      writeFile(update.path, update.updated);
      completedUpdates.push(update);
    });
  } catch (error) {
    completedUpdates.reverse().forEach((update) => {
      writeFile(update.path, update.original);
    });

    throw error;
  }
}

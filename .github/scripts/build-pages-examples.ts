import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

interface ExamplePackageJson {
  name?: string;
}

function parsePackageJson(value: string): ExamplePackageJson {
  const parsed: unknown = JSON.parse(value);

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Example package.json must contain a JSON object.');
  }

  return parsed as ExamplePackageJson;
}

const examplesRoot = 'examples';

const exampleDirectories = readdirSync(examplesRoot).filter((entry) =>
  statSync(join(examplesRoot, entry)).isDirectory(),
);

for (const directory of exampleDirectories) {
  const packageJsonPath = join(examplesRoot, directory, 'package.json');

  let packageJson: ExamplePackageJson;
  try {
    packageJson = parsePackageJson(readFileSync(packageJsonPath, 'utf8'));
  } catch {
    // Directories without a package.json (such as static site assets) are not examples.
    continue;
  }

  if (!packageJson.name) {
    throw new Error(`${packageJsonPath} is missing a "name" field.`);
  }

  const basePath = `/flow-stack/${directory}/`;

  console.log(`Building ${packageJson.name} with base path ${basePath}...`);

  execFileSync('pnpm', ['--filter', packageJson.name, 'build'], {
    env: { ...process.env, BASE_PATH: basePath },
    stdio: 'inherit',
  });
}

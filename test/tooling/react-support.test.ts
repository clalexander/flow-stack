import { describe, expect, it } from 'vitest';

import {
  createReactMajorUpdate,
  getSupportedReactMajors,
  updateCompatibilityText,
  writeReactSupportFiles,
} from '../../.github/scripts/react-support.js';

const packageJson = {
  name: 'flow-stack',
  peerDependencies: {
    react: '>=18 <20',
    'react-dom': '>=18 <20',
  },
};

describe('React support tooling', () => {
  it('derives supported majors from matching peer ranges', () => {
    expect(getSupportedReactMajors('>=18 <20', '>=18 <20')).toEqual([
      '18',
      '19',
    ]);
  });

  it('returns a no-op when the latest React major is already supported', () => {
    expect(createReactMajorUpdate(packageJson, '19.2.0')).toEqual({
      candidateMajor: 19,
      changed: false,
      packageJson,
      supportedMajors: ['18', '19'],
    });
  });

  it('adds only the next unsupported React major', () => {
    const result = createReactMajorUpdate(packageJson, '21.0.0');

    expect(result).toEqual({
      candidateMajor: 20,
      changed: true,
      packageJson: {
        ...packageJson,
        peerDependencies: {
          react: '>=18 <21',
          'react-dom': '>=18 <21',
        },
      },
      supportedMajors: ['18', '19', '20'],
    });
    expect(packageJson.peerDependencies).toEqual({
      react: '>=18 <20',
      'react-dom': '>=18 <20',
    });
  });

  it.each(['>=18', '^18 || ^19', '>=20 <20'])(
    'rejects unsupported peer range %s',
    (peerRange) => {
      expect(() => getSupportedReactMajors(peerRange, peerRange)).toThrow();
    },
  );

  it('rejects mismatched React and React DOM peer ranges', () => {
    expect(() => getSupportedReactMajors('>=18 <20', '>=18 <19')).toThrow(
      'React peer ranges must match',
    );
  });

  it('updates the canonical README compatibility sentence', () => {
    expect(
      updateCompatibilityText(
        'Install it. Requires React and React DOM 18 or 19. Continue.',
        ['18', '19', '20'],
      ),
    ).toBe('Install it. Requires React and React DOM 18, 19, or 20. Continue.');
  });

  it('rejects a missing or ambiguous README compatibility sentence', () => {
    expect(() => updateCompatibilityText('No compatibility.', ['18'])).toThrow(
      'found 0',
    );
    expect(() =>
      updateCompatibilityText(
        'Requires React and React DOM 18. Requires React and React DOM 18.',
        ['18'],
      ),
    ).toThrow('found 2');
  });

  it('rejects malformed versions without mutating package metadata', () => {
    const original = structuredClone(packageJson);

    expect(() => createReactMajorUpdate(packageJson, 'latest')).toThrow(
      'Could not parse React major',
    );
    expect(packageJson).toEqual(original);
  });

  it('rolls back completed writes when a later write fails', () => {
    const files = new Map([
      ['package.json', 'original package'],
      ['README.md', 'original README'],
    ]);
    const writeFile = (path: string, value: string) => {
      if (path === 'README.md' && value === 'updated README') {
        throw new Error('write failed');
      }

      files.set(path, value);
    };

    expect(() =>
      writeReactSupportFiles(
        [
          {
            original: 'original package',
            path: 'package.json',
            updated: 'updated package',
          },
          {
            original: 'original README',
            path: 'README.md',
            updated: 'updated README',
          },
        ],
        writeFile,
      ),
    ).toThrow('write failed');
    expect(Object.fromEntries(files)).toEqual({
      'README.md': 'original README',
      'package.json': 'original package',
    });
  });
});

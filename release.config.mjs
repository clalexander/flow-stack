/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { type: 'chore', scope: 'deps', release: 'patch' },
          { type: 'chore', scope: 'deps-dev', release: false },
          { type: 'ci', release: false },
          { type: 'test', release: false },
          { type: 'chore', scope: 'release', release: false },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};

/**
 * @type {import('semantic-release').GlobalConfig}
 */
const commitAnalyzer = [
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
];

const analysisPlugins = [
  commitAnalyzer,
  '@semantic-release/release-notes-generator',
];

export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins:
    process.env.RELEASE_ANALYSIS_ONLY === 'true'
      ? analysisPlugins
      : [
          ...analysisPlugins,
          '@semantic-release/changelog',
          '@semantic-release/npm',
          [
            '@semantic-release/git',
            {
              assets: ['package.json', 'CHANGELOG.md'],
              message:
                'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
            },
          ],
          '@semantic-release/github',
        ],
};

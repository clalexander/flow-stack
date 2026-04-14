import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit-and-integration',
          environment: 'node',
          include: ['test/unit/**/*.test.ts', 'test/integration/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'react',
          environment: 'jsdom',
          include: [
            'test/react/**/*.test.tsx',
            'test/react/**/*.test.ts',
            'test/integration/**/*.test.tsx',
          ],
          setupFiles: ['test/helpers/setup.ts'],
        },
      },
      {
        test: {
          name: 'types',
          include: ['test/types/**/*.test-d.ts'],
          typecheck: {
            enabled: true,
            only: true,
            include: ['test/types/**/*.test-d.ts'],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/core/**',
        'src/controller/NavigationStackController.ts',
        'src/components/NavigationStackScreen.tsx',
      ],
      thresholds: {
        lines: 85,
        branches: 80,
        functions: 85,
        statements: 85,
      },
    },
  },
});

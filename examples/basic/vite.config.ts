import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  plugins: [react()],
  base: basePath,
  resolve: {
    alias: {
      'flow-stack': fileURLToPath(
        new URL('../../src/index.ts', import.meta.url),
      ),
    },
  },
});

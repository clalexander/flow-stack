import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'flow-stack': fileURLToPath(
        new URL('../../src/index.ts', import.meta.url),
      ),
    },
  },
});

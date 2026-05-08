import { loadEnv } from 'vite';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: loadEnv('', process.cwd(), ''),
    setupFiles: ['./test/vitest.setup.ts'],
  },
});

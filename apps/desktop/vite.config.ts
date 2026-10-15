import path from 'path';

import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'ui'),
  base: './',
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: path.resolve(__dirname, 'ui/src/quasar-variables.sass'),
    }),
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-ui'),
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});

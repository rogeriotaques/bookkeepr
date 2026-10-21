import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  define: {
    // The app footer reads the build version; declare it for tests too.
    __VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.runtime.esm-bundler.js',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

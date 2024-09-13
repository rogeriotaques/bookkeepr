import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': '/src',
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },

  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});

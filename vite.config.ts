import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true,
        enableSourcemap: true,
      },
      // preprocess: preprocess({
      //   typescript: true,
      // }),
      experimental: {
        useVitePreprocess: true,
        generateMissingPreprocessorSourcemaps: true,
      },
    }),
  ],
});

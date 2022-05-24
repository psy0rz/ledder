
import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';

const SRC_DIR = path.resolve('./src');
const PUBLIC_DIR = path.resolve( './public');
const BUILD_DIR = path.resolve('./www',);

export default {
  plugins: [
    svelte({
      preprocess: autoPreprocess()
    }),


  ],
  root: SRC_DIR,
  base: '',
  publicDir: PUBLIC_DIR,

  build: {

    outDir: BUILD_DIR,
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      treeshake: false,
    },
  },
  resolve: {

    alias: {
      '@': SRC_DIR,
    },
  },
  server: {
    host: true,
    force: true
  },

};

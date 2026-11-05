import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets are loaded with relative paths on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

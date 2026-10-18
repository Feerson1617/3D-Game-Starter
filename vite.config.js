import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths are essential: the same build works in /REPO/ and
  // /REPO/pr-preview/pr-N/, without knowing the repository name at build time.
  base: './',
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
  build: { target: 'es2020', outDir: 'dist', sourcemap: false }
});

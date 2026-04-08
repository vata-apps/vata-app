import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      $: path.resolve(__dirname, './src'),
      $lib: path.resolve(__dirname, './src/lib'),
      $components: path.resolve(__dirname, './src/components'),
      $hooks: path.resolve(__dirname, './src/hooks'),
      $managers: path.resolve(__dirname, './src/managers'),
      '$db-system': path.resolve(__dirname, './src/db/system'),
      '$db-tree': path.resolve(__dirname, './src/db/trees'),
      $db: path.resolve(__dirname, './src/db'),
      $types: path.resolve(__dirname, './src/types'),
      '@vata-apps/gedcom-parser': path.resolve(__dirname, './src/gedcom-parser'),
      '@vata-apps/gedcom-date': path.resolve(__dirname, './src/gedcom-date'),
    },
  },
  test: {
    css: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**'],
    coverage: {
      provider: 'v8',
      exclude: ['src/routeTree.gen.ts', 'src/main.tsx'],
    },
  },
});

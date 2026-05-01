import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

const aliases = {
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
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: { alias: aliases },
  test: {
    coverage: {
      provider: 'v8',
      exclude: ['src/routeTree.gen.ts', 'src/main.tsx'],
    },
    projects: [
      {
        plugins: [react()],
        resolve: { alias: aliases },
        test: {
          name: 'unit',
          css: true,
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '.worktrees/**',
            'src/components/**/*.{test,spec}.tsx',
          ],
        },
      },
      {
        plugins: [storybookTest({ configDir: path.join(__dirname, '.storybook') })],
        resolve: { alias: aliases },
        optimizeDeps: {
          include: ['react/jsx-dev-runtime', 'react/jsx-runtime', 'react-dom/client'],
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

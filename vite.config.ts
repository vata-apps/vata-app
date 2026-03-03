import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: 'src/routes',
      generatedRouteTree: 'src/routeTree.gen.ts',
    }),
    react(),
  ],
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

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});

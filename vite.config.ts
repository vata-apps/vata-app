import stylex from '@stylexjs/unplugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    stylex.vite({
      aliases: {
        '$/*': [path.join(__dirname, 'src/*')],
      },
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: path.resolve(__dirname),
      },
    }),
    TanStackRouterVite({
      routesDirectory: 'src/routes',
      generatedRouteTree: 'src/routeTree.gen.ts',
    }),
    vanillaExtractPlugin(),
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
    target: ['es2021', 'chrome111', 'safari16.4'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});

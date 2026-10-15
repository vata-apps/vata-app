import type { StorybookConfig } from '@storybook/react-vite';
import stylex from '@stylexjs/unplugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(viteConfig) {
    // Storybook's react-vite framework brings its own React handling, and
    // stories never touch routing — drop the app's own copies of those plugins
    // (the route-tree generator would otherwise rewrite src/routeTree.gen.ts on
    // every Storybook start). Vanilla Extract and the path aliases flow through
    // the `...viteConfig` spread untouched, so `.css.ts` imports and `$…`
    // aliases work in stories with no extra wiring.
    const plugins = (viteConfig.plugins ?? []).flat().filter((plugin) => {
      if (!plugin || typeof plugin !== 'object') return true;
      const name = 'name' in plugin && typeof plugin.name === 'string' ? plugin.name : '';
      if (name.startsWith('vite:react')) return false;
      if (name.startsWith('tanstack-router') || name.startsWith('tanstack:router')) return false;
      if (name.toLowerCase().includes('stylex')) return false;
      return true;
    });

    return {
      ...viteConfig,
      cacheDir: path.join(projectRoot, 'node_modules/.vite-storybook'),
      plugins: [
        stylex.vite({
          aliases: {
            '$/*': [path.join(projectRoot, 'src/*')],
          },
          useCSSLayers: true,
          cssInjectionTarget: (fileName) => /(?:^|\/)iframe(?:-[\w-]+)?\.css$/.test(fileName),
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: projectRoot,
          },
        }),
        ...plugins,
      ],
    };
  },
};

export default config;

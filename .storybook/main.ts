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
    const plugins = (viteConfig.plugins ?? []).flat().filter((plugin) => {
      if (!plugin || typeof plugin !== 'object') return true;
      const name = 'name' in plugin && typeof plugin.name === 'string' ? plugin.name : '';
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

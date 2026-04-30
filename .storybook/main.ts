import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(viteConfig) {
    return {
      ...viteConfig,
      plugins: (viteConfig.plugins ?? []).flat().filter((plugin) => {
        if (!plugin || typeof plugin !== 'object') return true;
        const name = 'name' in plugin && typeof plugin.name === 'string' ? plugin.name : '';
        if (name.startsWith('vite:react')) return false;
        if (name.startsWith('tanstack-router') || name.startsWith('tanstack:router')) return false;
        return true;
      }),
    };
  },
};

export default config;

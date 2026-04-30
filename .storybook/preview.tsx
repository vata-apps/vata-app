import { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';

import i18n from '../src/i18n/config';
import '../src/styles/app.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      codePanel: true,
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'i18next language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'fr', title: 'Français' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    (Story, context) => {
      const locale = (context.globals.locale as string | undefined) ?? 'en';
      useEffect(() => {
        if (i18n.language !== locale) {
          void i18n.changeLanguage(locale);
        }
      }, [locale]);
      return <Story />;
    },
  ],
};

export default preview;

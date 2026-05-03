import { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';

import i18n from '../src/i18n/config';
import '../src/styles/app.css';
import './preview.css';

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

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
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
      themes: { light: 'light', dark: 'dark' },
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

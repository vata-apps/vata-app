import { useEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

import { Toast } from '../src/components/ui/toast';
import i18n from '../src/i18n/config';
import '../src/styles/app.css';
import '../src/design/theme.css';
import '../src/design/fonts';
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
      // 'todo'  — surface violations in the a11y panel only (no CI gate)
      // 'error' — fail the test run on violations
      // 'off'   — skip the checks
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
    // Mirrors app-theme.tsx: the resolved appearance lands on <html data-theme>,
    // which is what src/design/theme.css.ts keys the dark token set off.
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
    (Story, context) => {
      const locale = context.globals.locale as string;
      useEffect(() => {
        if (i18n.language !== locale) {
          void i18n.changeLanguage(locale);
        }
      }, [locale]);
      return <Story />;
    },
    // Every story runs inside a Toast provider so primitives that raise a toast
    // (and the Toast stories themselves) work without per-story setup.
    (Story) => (
      <Toast.Provider>
        <Story />
        <Toast.Viewport />
      </Toast.Provider>
    ),
  ],
};

export default preview;

import { useEffect, useState, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import i18n from '../src/i18n/config';
import '../src/styles/app.css';

function QueryClientDecorator({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
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
    (Story) => (
      <QueryClientDecorator>
        <Story />
      </QueryClientDecorator>
    ),
  ],
};

export default preview;

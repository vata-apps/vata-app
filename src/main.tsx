import './styles/app.css';
import '$/design/theme.css';
import '$/design/fonts';
import './i18n/config';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AppTheme } from '$components/app-theme';
import { Toast } from '$components/ui/toast';
import { queryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppTheme>
        <Toast.Provider>
          <RouterProvider router={router} />
          <Toast.Viewport />
        </Toast.Provider>
      </AppTheme>
    </QueryClientProvider>
  </React.StrictMode>
);

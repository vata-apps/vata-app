import '$/design/fonts';
import '$/design/theme.css';
import { Toast } from '$components/ui/toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config';
import { queryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';
import './styles/app.css';

const router = createRouter({
  context: { queryClient },
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toast.Provider>
        <RouterProvider router={router} />
        <TanStackRouterDevtools initialIsOpen={false} router={router} />
        <Toast.Viewport />
      </Toast.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);

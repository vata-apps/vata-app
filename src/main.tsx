import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MantineProvider, createTheme } from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "$lib/theme/ThemeProvider";
import { router } from "./router";

import "@mantine/core/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Good defaults for desktop app
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // Keep cache for 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

const theme = createTheme({
  primaryColor: "blue",
});

// We know the "root" element exists in index.html
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {({ mantineColorScheme }) => (
          <MantineProvider
            theme={theme}
            defaultColorScheme="auto"
            forceColorScheme={mantineColorScheme}
          >
            <RouterProvider router={router} />
          </MantineProvider>
        )}
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);

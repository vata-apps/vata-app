import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, createTheme } from "@mantine/core";
import { router } from "./router";
import { ThemeProvider } from "./lib/theme/ThemeProvider";

import "@mantine/core/styles.css";

const queryClient = new QueryClient();

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
    </QueryClientProvider>
  </React.StrictMode>,
);

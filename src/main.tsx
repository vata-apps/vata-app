import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "./lib/query-client";
import { router } from "./router";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// Ensure the router is ready before rendering
async function initializeApp() {
  await router.load();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <TanStackRouterDevtools router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

initializeApp();

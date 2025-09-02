import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Outlet } from "@tanstack/react-router";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />

      <Outlet />
    </MantineProvider>
  );
}

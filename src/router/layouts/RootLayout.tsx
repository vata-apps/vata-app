import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Outlet } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />

      <Outlet />
    </MantineProvider>
  );
}

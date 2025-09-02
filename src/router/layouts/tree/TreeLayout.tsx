import { AppShell, Stack } from "@mantine/core";
import { Outlet } from "@tanstack/react-router";
import { NavItem } from "./NavItem";
import { MAIN_MENU, SETTINGS_MENU } from "./menus";

export function TreeLayout() {
  return (
    <AppShell navbar={{ breakpoint: "", width: 80 }}>
      <AppShell.Navbar>
        <Stack justify="space-between" h="100%" py="xl">
          <Stack gap="sm" align="center" w="100%">
            {MAIN_MENU.map((item) => (
              <NavItem {...item} />
            ))}
          </Stack>

          <Stack gap="sm" align="center" w="100%">
            {SETTINGS_MENU.map((item) => (
              <NavItem {...item} />
            ))}
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

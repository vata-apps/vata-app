import { ThemeToggle } from "@/components/theme-toggle/ThemeToggle";
import { TreeSelector } from "@/components/TreeSelector";
import { TreeProvider } from "@/contexts/tree/tree-provider";
import {
  AppShell,
  Burger,
  Divider,
  Group,
  MantineProvider,
  NavLink,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <TreeProvider>
        <AppShell
          navbar={{
            breakpoint: "sm",
            collapsed: { mobile: !opened },
            width: 240,
          }}
          padding="md"
        >
          <AppShell.Navbar p="md">
            <Stack gap="md" h="100%">
              <Group justify="space-between" align="center">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
              </Group>

              <TreeSelector />

              <Divider />

              <Stack gap="xs" style={{ flexGrow: 1 }}>
                <NavLink
                  component={Link}
                  label="Home"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  to="/"
                />
                <NavLink
                  component={Link}
                  label="Individuals"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  to="/individuals"
                />
                <NavLink
                  component={Link}
                  label="Families"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  to="/families"
                />
                <NavLink
                  component={Link}
                  label="Places"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  to="/places"
                />
                <NavLink
                  component={Link}
                  label="Events"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  to="/events"
                />
              </Stack>

              <Divider />

              <Group justify="center">
                <ThemeToggle />
              </Group>
            </Stack>
          </AppShell.Navbar>

          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      </TreeProvider>
    </MantineProvider>
  );
}

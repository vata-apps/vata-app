import { ThemeToggle } from "@/components/theme-toggle/ThemeToggle";
import { TreeProvider } from "@/contexts/tree/tree-provider";
import {
  ActionIcon,
  AppShell,
  Burger,
  Divider,
  Group,
  MantineProvider,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import {
  IconCalendarEvent,
  IconHome,
  IconMapPin,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <TreeProvider>
        <AppShell
          navbar={{
            breakpoint: "sm",
            collapsed: { mobile: !opened },
            width: 80,
          }}
          padding="md"
        >
          <AppShell.Navbar py="md" px="xs">
            <Stack gap="md" h="100%" align="center">
              <Group justify="center" align="center" hiddenFrom="sm">
                <Burger opened={opened} onClick={toggle} size="sm" />
              </Group>

              <Divider hiddenFrom="sm" />

              <Stack gap="sm" align="center" w="100%">
                <Tooltip label="Home" position="right">
                  <ActionIcon
                    component={Link}
                    to="/"
                    variant={isActive("/") ? "filled" : "subtle"}
                    color={isActive("/") ? "blue" : undefined}
                    size={60}
                    radius="md"
                    w="100%"
                    h={60}
                  >
                    <IconHome size={28} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Individuals" position="right">
                  <ActionIcon
                    component={Link}
                    to="/individuals"
                    variant={isActive("/individuals") ? "filled" : "subtle"}
                    color={isActive("/individuals") ? "blue" : undefined}
                    size={60}
                    radius="md"
                    w="100%"
                    h={60}
                  >
                    <IconUsers size={28} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Families" position="right">
                  <ActionIcon
                    component={Link}
                    to="/families"
                    variant={isActive("/families") ? "filled" : "subtle"}
                    color={isActive("/families") ? "blue" : undefined}
                    size={60}
                    radius="md"
                    w="100%"
                    h={60}
                  >
                    <IconUsersGroup size={28} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Places" position="right">
                  <ActionIcon
                    component={Link}
                    to="/places"
                    variant={isActive("/places") ? "filled" : "subtle"}
                    color={isActive("/places") ? "blue" : undefined}
                    size={60}
                    radius="md"
                    w="100%"
                    h={60}
                  >
                    <IconMapPin size={28} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Events" position="right">
                  <ActionIcon
                    component={Link}
                    to="/events"
                    variant={isActive("/events") ? "filled" : "subtle"}
                    color={isActive("/events") ? "blue" : undefined}
                    size={60}
                    radius="md"
                    w="100%"
                    h={60}
                  >
                    <IconCalendarEvent size={28} />
                  </ActionIcon>
                </Tooltip>
              </Stack>

              <div style={{ flexGrow: 1 }} />

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

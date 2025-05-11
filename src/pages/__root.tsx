import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AppShell,
  Burger,
  Group,
  MantineProvider,
  NavLink,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 60 }}
        navbar={{
          breakpoint: "sm",
          collapsed: { mobile: !opened },
          width: 240,
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={600} size="xl">
              vata
            </Text>

            <ThemeToggle />
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
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
            to="/events"
          />
          <NavLink
            component={Link}
            label="Events"
            style={{ borderRadius: "var(--mantine-radius-md)" }}
            to="/places"
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

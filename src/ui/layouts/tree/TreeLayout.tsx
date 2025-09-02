import { LoadingState } from "@/components";
import { fetchTreeById } from "@/db/trees/fetchTreeById";
import { AppShell, Container, Stack } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { NavItem } from "./NavItem";
import { MAIN_MENU, SETTINGS_MENU } from "./menus";

export function TreeLayout() {
  const { treeId } = useParams({ from: "/$treeId" });
  const navigate = useNavigate();

  const { data: tree, isLoading } = useQuery({
    queryKey: ["tree", treeId],
    queryFn: () => fetchTreeById(treeId),
    enabled: Boolean(treeId),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isLoading || tree) return;
    navigate({ replace: true, to: "/" });
  }, [tree, isLoading, navigate]);

  return (
    <AppShell navbar={{ breakpoint: "", width: 80 }} padding="md">
      <AppShell.Navbar>
        <Stack justify="space-between" h="100%" py="xl">
          <Stack gap="sm" align="center" w="100%">
            {MAIN_MENU.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </Stack>

          <Stack gap="sm" align="center" w="100%">
            {SETTINGS_MENU.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {isLoading ? (
          <LoadingState message="Loading tree..." />
        ) : (
          <Container fluid px="md">
            <Outlet />
          </Container>
        )}
      </AppShell.Main>
    </AppShell>
  );
}

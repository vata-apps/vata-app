import { AppPath } from "@/router";
import { ActionIcon, Tooltip } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { Link, useParams } from "@tanstack/react-router";

interface NavItemProps {
  readonly icon: Icon;
  readonly label: string;
  readonly to: AppPath;
  readonly exact?: boolean;
}

export function NavItem({
  to,
  label,
  icon: Icon,
  exact = false,
}: NavItemProps) {
  const params = useParams({ from: "/$treeId" });

  return (
    <Tooltip label={label} position="right">
      <Link params={params} to={to} activeOptions={{ exact }}>
        {({ isActive }) => (
          <ActionIcon
            variant={isActive ? "filled" : "subtle"}
            color={isActive ? "blue" : undefined}
            radius="md"
            w={48}
            h={48}
          >
            <Icon size={24} />
          </ActionIcon>
        )}
      </Link>
    </Tooltip>
  );
}

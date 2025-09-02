import {
  IconCalendarEvent,
  IconHome,
  IconMapPin,
  IconSettings,
  IconTrees,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

export const MAIN_MENU = [
  {
    label: "Home",
    icon: IconHome,
    to: "/$treeId" as const,
    exact: true,
  },
  {
    label: "Individuals",
    icon: IconUsers,
    to: "/$treeId/individuals" as const,
    exact: false,
  },
  {
    label: "Families",
    icon: IconUsersGroup,
    to: "/$treeId/families" as const,
    exact: false,
  },
  {
    label: "Places",
    icon: IconMapPin,
    to: "/$treeId/places" as const,
    exact: false,
  },
  {
    label: "Events",
    icon: IconCalendarEvent,
    to: "/$treeId/events" as const,
    exact: false,
  },
];

export const SETTINGS_MENU = [
  {
    label: "Settings",
    icon: IconSettings,
    to: "/$treeId/settings" as const,
    exact: false,
  },
  {
    label: "Trees",
    icon: IconTrees,
    to: "/" as const,
    exact: false,
  },
];

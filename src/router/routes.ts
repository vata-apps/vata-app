import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./layouts/RootLayout";
import { TreeLayout } from "./layouts/tree/TreeLayout";
import { EventPage } from "./pages/EventPage";
import { EventsPage } from "./pages/EventsPage";
import { FamiliesPage } from "./pages/FamiliesPage";
import { FamilyPage } from "./pages/FamilyPage";
import { HomePage } from "./pages/HomePage";
import { IndividualPage } from "./pages/IndividualPage";
import { IndividualsPage } from "./pages/IndividualsPage";
import { PlacePage } from "./pages/PlacePage";
import { PlacesPage } from "./pages/PlacesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TreesPage } from "./pages/trees/TreesPage";

/**
 * Root route
 */
export const rootRoute = createRootRoute({
  component: RootLayout,
});

export const treesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TreesPage,
});

/**
 * Tree route, provides treeId parameter
 */

export const treeLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$treeId",
  component: TreeLayout,
});

// Home route within tree context
export const homeRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/",
  component: HomePage,
});

// Individuals routes within tree context
export const individualsRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/individuals",
  component: IndividualsPage,
});

export const individualRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/individuals/$individualId",
  component: IndividualPage,
});

// Families routes within tree context
export const familiesRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/families",
  component: FamiliesPage,
});

export const familyRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/families/$familyId",
  component: FamilyPage,
});

// Places routes within tree context
export const placesRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/places",
  component: PlacesPage,
});

export const placeRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/places/$placeId",
  component: PlacePage,
});

// Events routes within tree context
export const eventsRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/events",
  component: EventsPage,
});

export const eventRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/events/$eventId",
  component: EventPage,
});

// Settings route within tree context
export const settingsRoute = createRoute({
  getParentRoute: () => treeLayout,
  path: "/settings",
  component: SettingsPage,
});

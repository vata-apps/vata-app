import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import App from "../App";
import TreeSelectPage from "../pages/TreeSelectPage";
import TreeHomePage from "../pages/TreeHomePage";
import PlacesPage from "../pages/PlacesPage";
import PlacePage from "../pages/PlacePage";
import SettingsPage from "../pages/SettingsPage";
import ReferenceDataPage from "../pages/settings/ReferenceDataPage";
import PlaceTypesPage from "../pages/settings/PlaceTypesPage";
import EventTypesPage from "../pages/settings/EventTypesPage";
import EventRolesPage from "../pages/settings/EventRolesPage";
import ThemeSettingsPage from "../pages/settings/ThemeSettingsPage";
import PreferencesApp from "../PreferencesApp";

// Root route
const rootRoute = createRootRoute({
  component: App,
});

// Tree selection route (/)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TreeSelectPage,
});

// Tree home route (/:treeId)
const treeHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$treeId",
  component: TreeHomePage,
});

// Places list route (/:treeId/places)
const placesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$treeId/places",
  component: PlacesPage,
});

// Individual place route (/:treeId/places/:placeId)
const placeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$treeId/places/$placeId",
  component: PlacePage,
});

// Settings route (/:treeId/settings)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$treeId/settings",
  component: SettingsPage,
});

// Settings index route (/:treeId/settings/)
const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/",
  component: ReferenceDataPage,
});

// Place types route (/:treeId/settings/place-types)
const placeTypesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/place-types",
  component: PlaceTypesPage,
});

// Event types route (/:treeId/settings/event-types)
const eventTypesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/event-types",
  component: EventTypesPage,
});

// Event roles route (/:treeId/settings/event-roles)
const eventRolesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/event-roles",
  component: EventRolesPage,
});

// Theme settings route (/preferences/theme)
const themeSettingsRoute = createRoute({
  getParentRoute: () => preferencesRoute,
  path: "/theme",
  component: ThemeSettingsPage,
});

// Preferences route (/preferences)
const preferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preferences",
  component: PreferencesApp,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  treeHomeRoute,
  placesRoute,
  placeRoute,
  settingsRoute.addChildren([
    settingsIndexRoute,
    placeTypesRoute,
    eventTypesRoute,
    eventRolesRoute,
  ]),
  preferencesRoute.addChildren([themeSettingsRoute]),
]);

// Create and export router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  treeHomeRoute,
  placesRoute,
  placeRoute,
  settingsRoute.addChildren([settingsIndexRoute, placeTypesRoute]),
]);

// Create and export router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

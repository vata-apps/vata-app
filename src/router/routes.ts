import { createRootRoute, createRoute } from "@tanstack/react-router";

// Root route
export const rootRoute = createRootRoute({
  component: () => null, // We'll handle the layout in the main router
});

// Home route
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => import("./pages/HomePage").then((m) => m.HomePage),
});

// Individuals routes
export const individualsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/individuals",
  component: () =>
    import("./pages/IndividualsPage").then((m) => m.IndividualsPage),
});

export const individualRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/individuals/$individualId",
  component: () =>
    import("./pages/IndividualPage").then((m) => m.IndividualPage),
});

// Families routes
export const familiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/families",
  component: () => import("./pages/FamiliesPage").then((m) => m.FamiliesPage),
});

export const familyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/families/$familyId",
  component: () => import("./pages/FamilyPage").then((m) => m.FamilyPage),
});

// Places routes
export const placesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/places",
  component: () => import("./pages/PlacesPage").then((m) => m.PlacesPage),
});

export const placeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/places/$placeId",
  component: () => import("./pages/PlacePage").then((m) => m.PlacePage),
});

// Events routes
export const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: () => import("./pages/EventsPage").then((m) => m.EventsPage),
});

export const eventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$eventId",
  component: () => import("./pages/EventPage").then((m) => m.EventPage),
});

// Settings route
export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => import("./pages/SettingsPage").then((m) => m.SettingsPage),
});

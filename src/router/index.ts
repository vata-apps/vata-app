import { createRouter, RouteIds } from "@tanstack/react-router";
import {
  eventRoute,
  eventsRoute,
  familiesRoute,
  familyRoute,
  homeRoute,
  individualRoute,
  individualsRoute,
  placeRoute,
  placesRoute,
  rootRoute,
  settingsRoute,
  treeLayout,
  treesRoute,
} from "./routes";

// Create the route tree
const routeTree = rootRoute.addChildren([
  treesRoute,
  treeLayout.addChildren([
    homeRoute,
    individualsRoute,
    individualRoute,
    familiesRoute,
    familyRoute,
    placesRoute,
    placeRoute,
    eventsRoute,
    eventRoute,
    settingsRoute,
  ]),
]);

// Create the router
export const router = createRouter({ routeTree });

export type AppPath = Exclude<
  RouteIds<typeof routeTree>,
  "__root__" | "/$treeId/"
>;

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

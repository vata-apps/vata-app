import { createRouter } from "@tanstack/react-router";
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
} from "./routes";

// Create the route tree
const routeTree = rootRoute.addChildren([
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
]);

// Create the router
export const router = createRouter({ routeTree });

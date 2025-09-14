import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Home } from "./pages/Home";
import { NotFoundPage } from "./pages/prototype/NotFound";
import { TreeDashboard } from "./pages/prototype/TreeDashboard";

/**
 * Root route that wraps all other routes
 */
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});

/**
 * Index route (/) for tree management
 */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

/**
 * Tree route with dynamic treeId parameter
 * This will be the parent route for all tree-specific pages
 */
const treeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tree/$treeId",
  component: TreeDashboard,
});

/**
 * 404 Not Found route - catches all unmatched routes
 */
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
});

/**
 * Create the route tree
 */
const routeTree = rootRoute.addChildren([indexRoute, treeRoute, notFoundRoute]);

/**
 * Create the router instance
 */
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: NotFoundPage,
});

// Register the router instance for maximum type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

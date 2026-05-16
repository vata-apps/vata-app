import type { Decorator } from '@storybook/react-vite';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { type ComponentType, useState } from 'react';

/**
 * Mounts {@link Story} inside a minimal in-memory TanStack Router. A
 * catch-all route renders the story for every path, so navigation
 * triggered inside the story updates the location without a route miss.
 */
function StoryRouter({ Story, path }: { Story: ComponentType; path: string }): JSX.Element {
  const [router] = useState(() => {
    const rootRoute = createRootRoute();
    const catchAllRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '$',
      component: () => <Story />,
    });
    return createRouter({
      routeTree: rootRoute.addChildren([catchAllRoute]),
      history: createMemoryHistory({ initialEntries: [path] }),
    });
  });

  return <RouterProvider router={router} />;
}

/**
 * Storybook decorator that mounts the story inside an in-memory TanStack
 * Router, so components that use `<Link>` or router hooks render outside
 * the real app.
 *
 * Set the active location per story with `parameters.routerPath`
 * (defaults to `/`).
 */
export const withRouter: Decorator = (Story, context) => {
  const path = (context.parameters.routerPath as string | undefined) ?? '/';
  return <StoryRouter Story={Story as ComponentType} path={path} />;
};

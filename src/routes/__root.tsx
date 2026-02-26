import { createRootRoute, Outlet } from '@tanstack/react-router';
import { MainLayout } from '$components/layouts/MainLayout';

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});

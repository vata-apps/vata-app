import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId')({
  component: function SourceLayout() {
    return <Outlet />;
  },
});

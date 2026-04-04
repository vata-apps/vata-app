import { createFileRoute } from '@tanstack/react-router';
import { RepositoriesPage } from '$/pages/RepositoriesPage';

export const Route = createFileRoute('/tree/$treeId/repositories')({
  component: function RepositoriesRoute() {
    const { treeId } = Route.useParams();
    return <RepositoriesPage treeId={treeId} />;
  },
});

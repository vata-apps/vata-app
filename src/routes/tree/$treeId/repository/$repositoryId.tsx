import { createFileRoute } from '@tanstack/react-router';
import { RepositoryViewPage } from '$/pages/RepositoryViewPage';

export const Route = createFileRoute('/tree/$treeId/repository/$repositoryId')({
  component: function RepositoryViewRoute() {
    const { treeId, repositoryId } = Route.useParams();
    return <RepositoryViewPage treeId={treeId} repositoryId={repositoryId} />;
  },
});

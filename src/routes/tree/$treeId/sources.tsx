import { createFileRoute } from '@tanstack/react-router';
import { SourcesPage } from '$/pages/SourcesPage';

export const Route = createFileRoute('/tree/$treeId/sources')({
  component: function SourcesRoute() {
    const { treeId } = Route.useParams();
    return <SourcesPage treeId={treeId} />;
  },
});

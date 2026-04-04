import { createFileRoute } from '@tanstack/react-router';
import { SourceViewPage } from '$/pages/SourceViewPage';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId')({
  component: function SourceViewRoute() {
    const { treeId, sourceId } = Route.useParams();
    return <SourceViewPage treeId={treeId} sourceId={sourceId} />;
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { SourceWorkspacePage } from '$/pages/SourceWorkspacePage';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId/edit')({
  component: function SourceWorkspaceRoute() {
    const { treeId, sourceId } = Route.useParams();
    return <SourceWorkspacePage treeId={treeId} sourceId={sourceId} />;
  },
});

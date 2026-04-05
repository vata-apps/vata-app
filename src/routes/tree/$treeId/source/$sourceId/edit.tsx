import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tree/$treeId/source/$sourceId/edit')({
  component: function SourceWorkspaceRoute() {
    const { sourceId } = Route.useParams();
    return (
      <div>
        <p>Source Workspace — {sourceId}</p>
        <p>Coming soon...</p>
      </div>
    );
  },
});

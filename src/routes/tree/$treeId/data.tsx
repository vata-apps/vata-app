import { createFileRoute } from '@tanstack/react-router';
import { DataBrowserPage } from '$/pages/DataBrowser';

export const Route = createFileRoute('/tree/$treeId/data')({
  component: function DataRoute() {
    const { treeId } = Route.useParams();
    return <DataBrowserPage treeId={treeId} />;
  },
});

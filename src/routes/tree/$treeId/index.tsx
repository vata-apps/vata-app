import { createFileRoute } from '@tanstack/react-router';
import { TreeViewPage } from '$/pages/TreeView';

export const Route = createFileRoute('/tree/$treeId/')({
  component: function TreeViewRoute() {
    const { treeId } = Route.useParams();
    return <TreeViewPage treeId={treeId} />;
  },
});

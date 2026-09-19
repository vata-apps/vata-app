import { createFileRoute } from '@tanstack/react-router';
import { TreeDashboard } from '$/pages/TreeView';
import { t } from 'i18next';
import { RouterLoaderData } from '$/types/router';

export const Route = createFileRoute('/tree/$treeId/')({
  component: function TreeViewRoute() {
    const { treeId } = Route.useParams();
    return <TreeDashboard treeId={treeId} />;
  },

  loader: (): RouterLoaderData => ({
    breadcrumb: { label: t('nav.home') },
  }),
});

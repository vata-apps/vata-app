import { createFileRoute } from '@tanstack/react-router';
import { TreeViewPage } from '$/pages/TreeView';
import { t } from 'i18next';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';

export const Route = createFileRoute('/tree/$treeId/')({
  component: function TreeViewRoute() {
    const { treeId } = Route.useParams();
    return <TreeViewPage treeId={treeId} />;
  },
  loader: (): BreadcrumpLoaderData => ({
    breadcrumb: [{ label: t('nav.home'), route: null }],
  }),
});

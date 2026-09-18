import { createFileRoute } from '@tanstack/react-router';
import { FamiliesPage } from '$/pages/FamiliesPage';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/families')({
  component: function FamiliesRoute() {
    const { treeId } = Route.useParams();
    return <FamiliesPage treeId={treeId} />;
  },
  loader: (): BreadcrumpLoaderData => ({
    breadcrumb: [{ label: t('nav.families'), route: null }],
  }),
});

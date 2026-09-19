import { createFileRoute } from '@tanstack/react-router';
import { FamiliesPage } from '$/pages/FamiliesPage';
import { RouterLoaderData } from '$/types/router';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/families')({
  component: function FamiliesRoute() {
    const { treeId } = Route.useParams();
    return <FamiliesPage treeId={treeId} />;
  },

  loader: (): RouterLoaderData => ({
    breadcrumb: { label: t('nav.families') },
  }),
});

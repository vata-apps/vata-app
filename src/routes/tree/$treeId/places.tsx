import { createFileRoute } from '@tanstack/react-router';
import { PlacesPage } from '$/pages/PlacesPage';
import { RouterLoaderData } from '$/types/router';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/places')({
  component: function PlacesRoute() {
    const { treeId } = Route.useParams();
    return <PlacesPage treeId={treeId} />;
  },

  loader: (): RouterLoaderData => ({
    breadcrumb: { label: t('nav.places') },
  }),
});

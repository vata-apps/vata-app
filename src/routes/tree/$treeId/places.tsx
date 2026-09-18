import { createFileRoute } from '@tanstack/react-router';
import { PlacesPage } from '$/pages/PlacesPage';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/places')({
  component: function PlacesRoute() {
    const { treeId } = Route.useParams();
    return <PlacesPage treeId={treeId} />;
  },
  loader: (): BreadcrumpLoaderData => ({
    breadcrumb: [{ label: t('nav.places'), route: null }],
  }),
});

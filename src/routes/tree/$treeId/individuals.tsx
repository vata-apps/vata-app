import { createFileRoute } from '@tanstack/react-router';
import { IndividualsPage } from '$/pages/IndividualsPage';
import { t } from 'i18next';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';

export const Route = createFileRoute('/tree/$treeId/individuals')({
  component: function IndividualsRoute() {
    const { treeId } = Route.useParams();
    return <IndividualsPage treeId={treeId} />;
  },
  loader: (): BreadcrumpLoaderData => ({
    breadcrumb: [{ label: t('nav.individuals'), route: null }],
  }),
});

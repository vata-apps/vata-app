import { createFileRoute } from '@tanstack/react-router';
import { EventsPage } from '$/pages/EventsPage';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/events')({
  component: function EventsRoute() {
    const { treeId } = Route.useParams();
    return <EventsPage treeId={treeId} />;
  },
  loader: (): BreadcrumpLoaderData => ({
    breadcrumb: [{ label: t('nav.events'), route: null }],
  }),
});

import { createFileRoute } from '@tanstack/react-router';
import { EventsPage } from '$/pages/EventsPage';
import { RouterLoaderData } from '$/types/router';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/events')({
  component: function EventsRoute() {
    const { treeId } = Route.useParams();
    return <EventsPage treeId={treeId} />;
  },

  loader: (): RouterLoaderData => ({
    breadcrumb: { label: t('nav.events') },
  }),
});

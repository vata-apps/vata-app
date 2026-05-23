import { createFileRoute } from '@tanstack/react-router';
import { EventsPage } from '$/pages/EventsPage';

export const Route = createFileRoute('/tree/$treeId/events')({
  component: function EventsRoute() {
    const { treeId } = Route.useParams();
    return <EventsPage treeId={treeId} />;
  },
});

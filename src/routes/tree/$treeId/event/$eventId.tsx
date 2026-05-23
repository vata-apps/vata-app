import { createFileRoute } from '@tanstack/react-router';
import { EventViewPage } from '$/pages/EventViewPage';

export const Route = createFileRoute('/tree/$treeId/event/$eventId')({
  component: function EventViewRoute() {
    const { treeId, eventId } = Route.useParams();
    return <EventViewPage treeId={treeId} eventId={eventId} />;
  },
});

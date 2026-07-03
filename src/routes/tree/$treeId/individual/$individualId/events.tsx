import { createFileRoute } from '@tanstack/react-router';
import { PersonEventsPage } from '$/pages/PersonEventsPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/events')({
  component: function PersonEventsRoute() {
    const { treeId, individualId } = Route.useParams();
    return <PersonEventsPage treeId={treeId} individualId={individualId} />;
  },
});

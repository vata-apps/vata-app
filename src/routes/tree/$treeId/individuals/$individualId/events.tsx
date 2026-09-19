import { createFileRoute } from '@tanstack/react-router';
import { PersonEventsPage } from '$/pages/PersonEventsPage';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId/events')({
  component: PersonEventsPage,
});

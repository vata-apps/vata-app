import { createFileRoute } from '@tanstack/react-router';
import { PersonSourcesPage } from '$/pages/PersonSourcesPage';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId/sources')({
  component: PersonSourcesPage,
});

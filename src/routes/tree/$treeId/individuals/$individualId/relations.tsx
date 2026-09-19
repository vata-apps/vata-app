import { createFileRoute } from '@tanstack/react-router';
import { PersonRelationsPage } from '$/pages/PersonRelationsPage';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId/relations')({
  component: PersonRelationsPage,
});

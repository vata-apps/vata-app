import { createFileRoute } from '@tanstack/react-router';
import { PersonNamesPage } from '$/pages/PersonNamesPage';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId/names')({
  component: PersonNamesPage,
});

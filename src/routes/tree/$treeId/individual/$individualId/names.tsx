import { createFileRoute } from '@tanstack/react-router';
import { PersonNamesPage } from '$/pages/PersonNamesPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/names')({
  component: PersonNamesPage,
});

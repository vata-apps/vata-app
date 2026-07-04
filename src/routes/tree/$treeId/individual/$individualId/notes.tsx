import { createFileRoute } from '@tanstack/react-router';
import { PersonNotesPage } from '$/pages/PersonNotesPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/notes')({
  component: PersonNotesPage,
});

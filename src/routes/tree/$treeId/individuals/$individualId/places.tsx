import { createFileRoute } from '@tanstack/react-router';
import { PersonPlacesPage } from '$/pages/PersonPlacesPage';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId/places')({
  component: PersonPlacesPage,
});

import { createFileRoute } from '@tanstack/react-router';
import { PlacesPage } from '$/pages/PlacesPage';

export const Route = createFileRoute('/tree/$treeId/places')({
  component: function PlacesRoute() {
    const { treeId } = Route.useParams();
    return <PlacesPage treeId={treeId} />;
  },
});

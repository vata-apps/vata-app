import { createFileRoute } from '@tanstack/react-router';
import { PlaceViewPage } from '$/pages/PlaceViewPage';

export const Route = createFileRoute('/tree/$treeId/place/$placeId')({
  component: function PlaceViewRoute() {
    const { treeId, placeId } = Route.useParams();
    return <PlaceViewPage treeId={treeId} placeId={placeId} />;
  },
});

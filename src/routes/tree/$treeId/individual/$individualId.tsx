import { createFileRoute } from '@tanstack/react-router';
import { IndividualViewPage } from '$/pages/IndividualViewPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: function IndividualViewRoute() {
    const { treeId, individualId } = Route.useParams();
    return <IndividualViewPage treeId={treeId} individualId={individualId} />;
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { IndividualLayout } from '$/pages/IndividualLayout';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: function IndividualRoute() {
    const { treeId, individualId } = Route.useParams();
    return <IndividualLayout treeId={treeId} individualId={individualId} />;
  },
});

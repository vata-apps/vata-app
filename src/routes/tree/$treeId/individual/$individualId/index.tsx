import { createFileRoute } from '@tanstack/react-router';
import { IndividualOverviewPage } from '$/pages/IndividualOverviewPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/')({
  component: function IndividualOverviewRoute() {
    const { treeId, individualId } = Route.useParams();
    return <IndividualOverviewPage treeId={treeId} individualId={individualId} />;
  },
});

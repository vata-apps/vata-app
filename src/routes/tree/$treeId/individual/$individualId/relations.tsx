import { createFileRoute } from '@tanstack/react-router';
import { PersonRelationsPage } from '$/pages/PersonRelationsPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/relations')({
  component: function PersonRelationsRoute() {
    const { treeId, individualId } = Route.useParams();
    return <PersonRelationsPage treeId={treeId} individualId={individualId} />;
  },
});

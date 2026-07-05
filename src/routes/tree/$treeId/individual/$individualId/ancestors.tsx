import { createFileRoute } from '@tanstack/react-router';
import { PersonAncestorsPage } from '$/pages/PersonAncestorsPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId/ancestors')({
  component: function PersonAncestorsRoute() {
    const { treeId, individualId } = Route.useParams();
    return <PersonAncestorsPage treeId={treeId} individualId={individualId} />;
  },
});

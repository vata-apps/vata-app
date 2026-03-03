import { createFileRoute } from '@tanstack/react-router';
import { FamiliesPage } from '$/pages/FamiliesPage';

export const Route = createFileRoute('/tree/$treeId/families')({
  component: function FamiliesRoute() {
    const { treeId } = Route.useParams();
    return <FamiliesPage treeId={treeId} />;
  },
});

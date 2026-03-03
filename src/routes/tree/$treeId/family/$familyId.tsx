import { createFileRoute } from '@tanstack/react-router';
import { FamilyViewPage } from '$/pages/FamilyViewPage';

export const Route = createFileRoute('/tree/$treeId/family/$familyId')({
  component: function FamilyViewRoute() {
    const { treeId, familyId } = Route.useParams();
    return <FamilyViewPage treeId={treeId} familyId={familyId} />;
  },
});

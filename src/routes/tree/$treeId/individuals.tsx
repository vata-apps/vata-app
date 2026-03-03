import { createFileRoute } from '@tanstack/react-router';
import { IndividualsPage } from '$/pages/IndividualsPage';

export const Route = createFileRoute('/tree/$treeId/individuals')({
  component: function IndividualsRoute() {
    const { treeId } = Route.useParams();
    return <IndividualsPage treeId={treeId} />;
  },
});

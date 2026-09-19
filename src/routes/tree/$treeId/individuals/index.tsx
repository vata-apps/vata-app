import { IndividualsPage } from '$/pages/IndividualsPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tree/$treeId/individuals/')({
  component: function IndividualsRoute() {
    const { treeId } = Route.useParams();
    return <IndividualsPage treeId={treeId} />;
  },
});

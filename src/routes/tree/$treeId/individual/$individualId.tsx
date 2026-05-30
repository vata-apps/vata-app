import { createFileRoute } from '@tanstack/react-router';
import { IndividualViewPage } from '$/pages/IndividualViewPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: IndividualViewPage,
});

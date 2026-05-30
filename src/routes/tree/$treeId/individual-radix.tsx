import { createFileRoute } from '@tanstack/react-router';
import { IndividualOverviewRadixPage } from '$/pages/IndividualOverviewRadixPage';

export const Route = createFileRoute('/tree/$treeId/individual-radix')({
  component: IndividualOverviewRadixPage,
});

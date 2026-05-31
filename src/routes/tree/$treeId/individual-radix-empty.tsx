import { createFileRoute } from '@tanstack/react-router';

import { IndividualOverviewEmptyPage } from '$/pages/IndividualOverviewEmptyPage';

export const Route = createFileRoute('/tree/$treeId/individual-radix-empty')({
  component: IndividualOverviewEmptyPage,
});

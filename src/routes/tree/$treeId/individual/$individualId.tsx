import { createFileRoute } from '@tanstack/react-router';
import { IndividualLayout } from '$/pages/IndividualLayout';
import { getPersonOverview } from '$/db/trees/person-overview';
import { formatName } from '$/db/trees/names';
import { t } from 'i18next';
import { BreadcrumpLoaderData } from '$/components/ui/breadcrumb/breadcrumb';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: function IndividualRoute() {
    const { treeId, individualId } = Route.useParams();
    return <IndividualLayout treeId={treeId} individualId={individualId} />;
  },
  loader: async ({ params }): Promise<BreadcrumpLoaderData> => {
    // TODO: get the name only
    const person = await getPersonOverview(params.individualId);

    return {
      breadcrumb: [
        {
          label: t('nav.individuals'),
          route: {
            to: '/tree/$treeId/individuals',
            params: { treeId: params.treeId },
          },
        },
        { label: formatName(person?.primaryName || null).full, route: null },
      ],
    };
  },
});

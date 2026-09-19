import { createFileRoute } from '@tanstack/react-router';
import { IndividualLayout } from '$/pages/IndividualLayout';
import { getPersonOverview } from '$/db/trees/person-overview';
import { formatName } from '$/db/trees/names';
import { RouterLoaderData } from '$/types/router';

export const Route = createFileRoute('/tree/$treeId/individuals/$individualId')({
  component: function IndividualRoute() {
    const { treeId, individualId } = Route.useParams();
    return <IndividualLayout treeId={treeId} individualId={individualId} />;
  },

  loader: async ({ params }): Promise<RouterLoaderData> => {
    // TODO: get the name only
    const person = await getPersonOverview(params.individualId);

    return {
      breadcrumb: { label: formatName(person?.primaryName || null).full },
    };
  },
});

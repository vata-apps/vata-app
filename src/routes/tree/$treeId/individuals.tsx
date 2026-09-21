import { DEFAULT_QUERY, individualsQuery } from '$/pages/tree/individuals/IndividualsList.queries';
import { RouterLoaderData } from '$/types/router';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { t } from 'i18next';

export const Route = createFileRoute('/tree/$treeId/individuals')({
  component: function IndividualsRoute() {
    return <Outlet />;
  },

  loader: async ({ context }): Promise<RouterLoaderData> => {
    await context.queryClient.ensureQueryData(individualsQuery(DEFAULT_QUERY));

    return {
      breadcrumb: { label: t('nav.individuals') },
      create: { labelKey: 'page.create' },
    };
  },
});

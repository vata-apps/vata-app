import { createFileRoute, Outlet } from '@tanstack/react-router';
import { t } from 'i18next';
import { RouterLoaderData } from '$/types/router';

export const Route = createFileRoute('/tree/$treeId/individuals')({
  component: function IndividualsRoute() {
    return <Outlet />;
  },

  loader: (): RouterLoaderData => ({
    breadcrumb: { label: t('nav.individuals') },
    create: { labelKey: 'page.create' },
  }),
});

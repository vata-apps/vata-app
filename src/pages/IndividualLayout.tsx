import { Box, Flex } from '@radix-ui/themes';
import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { IdentityHeader, OverviewTabs } from '$components/person-overview/identity-header';
import { usePersonOverview } from '$hooks/usePersonOverview';

interface IndividualLayoutProps {
  treeId: string;
  individualId: string;
}

/**
 * The shell shared by every tab of one individual: the identity header and the
 * section tab bar, with the active tab rendered through `<Outlet/>`. Identity
 * data comes from {@link usePersonOverview}; the same cached query backs the
 * Overview tab, so switching tabs never refetches the header.
 */
export function IndividualLayout({ treeId, individualId }: IndividualLayoutProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePersonOverview(individualId);

  if (isLoading) {
    return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  }

  // A query failure must not masquerade as "not found" — surface a load error.
  if (isError) {
    return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;
  }

  if (!data) {
    return <CenteredMessage>{t('overview.notFound')}</CenteredMessage>;
  }

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <IdentityHeader person={data.person} />
        <Flex direction="column" gap="4">
          <OverviewTabs treeId={treeId} individualId={individualId} />
          <Outlet />
        </Flex>
      </Flex>
    </Box>
  );
}

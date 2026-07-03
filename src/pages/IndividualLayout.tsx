import { Box, Flex, Text } from '@radix-ui/themes';
import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

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
  const { data, isLoading } = usePersonOverview(individualId);

  if (isLoading) {
    return (
      <Flex p="6" justify="center">
        <Text color="gray">{t('overview.loading')}</Text>
      </Flex>
    );
  }

  if (!data) {
    return (
      <Flex p="6" justify="center">
        <Text color="gray">{t('overview.notFound')}</Text>
      </Flex>
    );
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

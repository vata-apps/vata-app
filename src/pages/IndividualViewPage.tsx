import { Box, Flex, Grid, Text } from '@radix-ui/themes';
import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { IdentityHeader, OverviewTabs } from '$components/person-overview/identity-header';
import { LifeSpine } from '$components/person-overview/life-spine';
import { PlacesLivedPanel } from '$components/person-overview/places-lived-panel';
import { RecordRail } from '$components/person-overview/record-rail';
import { VitalsPanel } from '$components/person-overview/vitals-panel';
import { usePersonOverview } from '$hooks/usePersonOverview';

const routeApi = getRouteApi('/tree/$treeId/individual/$individualId');

/**
 * The Person Overview for one individual: the identity header, section tabs, a
 * parents/names/media rail, and a life-events spine — all driven by live tree
 * data via {@link usePersonOverview}.
 *
 * The research-notes aside, suggestions, and places map are intentionally
 * omitted: those panels have no data model yet.
 */
export function IndividualViewPage(): JSX.Element {
  const { t } = useTranslation('individuals');
  const { treeId, individualId } = routeApi.useParams();
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
          <OverviewTabs />
          <Grid
            columns={{ initial: '1', sm: 'minmax(0, 1fr) minmax(0, 2fr)' }}
            gap="4"
            align="start"
          >
            <Flex direction="column" gap="4">
              <VitalsPanel vitals={data.vitals} treeId={treeId} />
              <RecordRail parents={data.parents} names={data.names} treeId={treeId} />
            </Flex>
            <Flex direction="column" gap="4">
              <LifeSpine milestones={data.milestones} treeId={treeId} />
              <PlacesLivedPanel places={data.placesLived} treeId={treeId} />
            </Flex>
          </Grid>
        </Flex>
      </Flex>
    </Box>
  );
}

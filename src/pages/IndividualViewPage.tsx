import { Box, Flex, Grid, Text } from '@radix-ui/themes';
import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { IdentityHeader, OverviewTabs } from '$components/person-overview-radix/identity-header';
import { LifeSpine } from '$components/person-overview-radix/life-spine';
import { PlacesLivedPanel } from '$components/person-overview-radix/places-lived-panel';
import { RecordRail } from '$components/person-overview-radix/record-rail';
import { StatsRow } from '$components/person-overview-radix/stats-row';
import { usePersonOverview } from '$hooks/usePersonOverview';
import { usePersonStats } from '$hooks/usePersonStats';

const routeApi = getRouteApi('/tree/$treeId/individual/$individualId');

/**
 * The Person Overview for one individual: the pure-Radix identity header,
 * section tabs, a parents/names/media rail, and a life-events spine — all
 * driven by live tree data via {@link usePersonOverview}.
 *
 * The research-notes aside, suggestions, and places map from the design
 * prototype are intentionally omitted: those panels have no data model yet.
 */
export function IndividualViewPage(): JSX.Element {
  const { t } = useTranslation('individuals');
  const { treeId, individualId } = routeApi.useParams();
  const { data, isLoading } = usePersonOverview(individualId);
  const { data: stats } = usePersonStats(individualId);

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
          {stats && <StatsRow stats={stats} />}
          <Grid
            columns={{ initial: '1', sm: 'minmax(0, 1fr) minmax(0, 2fr)' }}
            gap="4"
            align="start"
          >
            <RecordRail parents={data.parents} names={data.names} media={data.media} />
            <LifeSpine milestones={data.milestones} />
          </Grid>
          <PlacesLivedPanel places={data.placesLived} treeId={treeId} />
        </Flex>
      </Flex>
    </Box>
  );
}

import { Flex, Grid } from '@radix-ui/themes';

import { LifeSpine } from '$components/person-overview/life-spine';
import { PlacesLivedPanel } from '$components/person-overview/places-lived-panel';
import { RecordRail } from '$components/person-overview/record-rail';
import { VitalsPanel } from '$components/person-overview/vitals-panel';
import { usePersonOverview } from '$hooks/usePersonOverview';

interface IndividualOverviewPageProps {
  treeId: string;
  individualId: string;
}

/**
 * The Overview tab body: a parents/names/media rail beside a life-events spine
 * and places-lived panel, all driven by live tree data via
 * {@link usePersonOverview}. The identity header and tabs live in the layout.
 *
 * The research-notes aside, suggestions, and places map are intentionally
 * omitted: those panels have no data model yet.
 */
export function IndividualOverviewPage({
  treeId,
  individualId,
}: IndividualOverviewPageProps): JSX.Element | null {
  const { data } = usePersonOverview(individualId);

  // The layout gates on loading / not-found before rendering this Outlet, and
  // both read the same cached query — so `data` is present here; this guard is
  // only for type narrowing.
  if (!data) return null;

  return (
    <Grid columns={{ initial: '1', sm: 'minmax(0, 1fr) minmax(0, 2fr)' }} gap="4" align="start">
      <Flex direction="column" gap="4">
        <VitalsPanel vitals={data.vitals} treeId={treeId} />
        <RecordRail parents={data.parents} names={data.names} treeId={treeId} />
      </Flex>
      <Flex direction="column" gap="4">
        <LifeSpine milestones={data.milestones} treeId={treeId} />
        <PlacesLivedPanel places={data.placesLived} treeId={treeId} />
      </Flex>
    </Grid>
  );
}

import { Box, Flex, Grid } from '@radix-ui/themes';
import { getRouteApi } from '@tanstack/react-router';

import { IdentityHeader, OverviewTabs } from '$components/person-overview-radix/identity-header';
import { LifeSpine } from '$components/person-overview-radix/life-spine';
import { edouardTremblayOverview } from '$components/person-overview-radix/overview-mock';
import { PlacesPanel } from '$components/person-overview-radix/places-panel';
import { ProfileAside } from '$components/person-overview-radix/profile-aside';
import { RecordRail } from '$components/person-overview-radix/record-rail';

const routeApi = getRouteApi('/tree/$treeId/individual-radix-empty');

/**
 * "Missing data" state of the Person Overview — Édouard Tremblay has only his
 * father and the marriage to Marie Garneau recorded. Every other section
 * (birth, death, places, media, research notes) is empty, exercising the
 * empty/unknown states of each panel.
 *
 * Static design experiment: content comes from {@link edouardTremblayOverview},
 * not the live tree database.
 */
export function IndividualOverviewEmptyPage(): JSX.Element {
  const { treeId } = routeApi.useParams();
  const { person, parents, names, media, milestones, places, researchNotes, suggestions } =
    edouardTremblayOverview;

  return (
    <Box p="4">
      <Grid columns={{ initial: '1', md: 'minmax(0, 1fr) 320px' }} gap="4" align="start">
        {/* Left: header + tabs + tabbed content */}
        <Flex direction="column" gap="4">
          <IdentityHeader person={person} />
          <Flex direction="column" gap="4">
            <OverviewTabs />
            <Grid
              columns={{ initial: '1', sm: 'minmax(0, 1fr) minmax(0, 2fr)' }}
              gap="4"
              align="start"
            >
              <RecordRail parents={parents} names={names} media={media} treeId={treeId} />
              <Flex direction="column" gap="4">
                <LifeSpine milestones={milestones} treeId={treeId} />
                {places.legend.length > 0 && <PlacesPanel legend={places.legend} />}
              </Flex>
            </Grid>
          </Flex>
        </Flex>

        {/* Right: persistent aside */}
        <ProfileAside researchNotes={researchNotes} suggestions={suggestions} />
      </Grid>
    </Box>
  );
}

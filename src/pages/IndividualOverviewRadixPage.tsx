import { Box, Flex, Grid } from '@radix-ui/themes';
import { getRouteApi } from '@tanstack/react-router';

import { IdentityHeader, OverviewTabs } from '$components/person-overview-radix/identity-header';
import { LifeSpine } from '$components/person-overview-radix/life-spine';
import { personOverview } from '$components/person-overview-radix/overview-mock';
import { PlacesPanel } from '$components/person-overview-radix/places-panel';
import { ProfileAside } from '$components/person-overview-radix/profile-aside';
import { RecordRail } from '$components/person-overview-radix/record-rail';

const routeApi = getRouteApi('/tree/$treeId/individual-radix');

/**
 * A pure-`@radix-ui/themes` rebuild of the Person Overview, used to test how
 * far the design carries with Radix components alone — no Lucide `Icon`, no
 * custom CSS, no raw color tokens. Features Radix cannot express (the map
 * surface, milestone glyphs, the timeline rail) are dropped rather than faked.
 *
 * Layout: two columns from the very top — the left holds the identity band,
 * the tabs, and the tabbed content (record rail, life spine); the right is a
 * persistent aside, outside both the header and the tabs.
 *
 * Static design experiment: content comes from {@link personOverview}, not the
 * live tree database.
 */
export function IndividualOverviewRadixPage(): JSX.Element {
  const { treeId } = routeApi.useParams();
  const { person, parents, names, media, milestones, places, researchNotes, suggestions } =
    personOverview;

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
                <PlacesPanel legend={places.legend} />
              </Flex>
            </Grid>
          </Flex>
        </Flex>

        {/* Right: persistent aside, outside the header and the tabs */}
        <ProfileAside researchNotes={researchNotes} suggestions={suggestions} />
      </Grid>
    </Box>
  );
}

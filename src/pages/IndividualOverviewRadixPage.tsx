import { Box, Flex, Grid } from '@radix-ui/themes';

import { IdentityHeader } from '$components/person-overview-radix/identity-header';
import { LifeSpine } from '$components/person-overview-radix/life-spine';
import { personOverview } from '$components/person-overview-radix/overview-mock';
import { PlacesLivedPanel } from '$components/person-overview-radix/places-lived-panel';
import { ProfileAside } from '$components/person-overview-radix/profile-aside';
import { RecordRail } from '$components/person-overview-radix/record-rail';

/**
 * A pure-`@radix-ui/themes` rebuild of the Person Overview, used to test how
 * far the design carries with Radix components alone — no Lucide `Icon`, no
 * custom CSS, no raw color tokens. Features Radix cannot express (the map
 * surface, milestone glyphs, the timeline rail) are dropped rather than faked.
 *
 * Static design experiment: content comes from {@link personOverview}, not the
 * live tree database.
 */
export function IndividualOverviewRadixPage(): JSX.Element {
  const { person, figures, parents, marriage, milestones, places, completion, media, suggestions } =
    personOverview;

  return (
    <Box p="6">
      <Flex direction="column" gap="6">
        <IdentityHeader person={person} />

        <Grid columns={{ initial: '1', md: 'minmax(0, 1fr) 320px' }} gap="5" align="start">
          <Flex direction="column" gap="5">
            <Grid columns={{ initial: '1', sm: '285px minmax(0, 1fr)' }} gap="5" align="start">
              <RecordRail figures={figures} parents={parents} marriage={marriage} />
              <LifeSpine milestones={milestones} />
            </Grid>
            <PlacesLivedPanel region={places.region} legend={places.legend} />
          </Flex>

          <ProfileAside completion={completion} media={media} suggestions={suggestions} />
        </Grid>
      </Flex>
    </Box>
  );
}

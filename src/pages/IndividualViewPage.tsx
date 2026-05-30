import { Box, Flex, Grid } from '@radix-ui/themes';

import { IdentityHeader } from '$components/person-overview/identity-header';
import { LifeSpine } from '$components/person-overview/life-spine';
import { personOverview } from '$components/person-overview/overview-mock';
import { PlacesLivedPanel } from '$components/person-overview/places-lived-panel';
import { ProfileAside } from '$components/person-overview/profile-aside';
import { RecordRail } from '$components/person-overview/record-rail';

/**
 * The Person Overview — a full-width chronology of one individual: an
 * identity header, a record rail beside a life-spine timeline, a places-lived
 * map, and a right column of completion, media, and research panels.
 *
 * This is a static design replication of the "Person Overview — Chronology"
 * mockup; its content comes from {@link personOverview} rather than the live
 * tree database.
 */
export function IndividualViewPage(): JSX.Element {
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
            <PlacesLivedPanel region={places.region} pins={places.pins} legend={places.legend} />
          </Flex>

          <ProfileAside completion={completion} media={media} suggestions={suggestions} />
        </Grid>
      </Flex>
    </Box>
  );
}

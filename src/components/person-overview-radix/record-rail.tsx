import { Box, Card, Flex, Grid, Heading, Inset, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type {
  OverviewMediaTile,
  OverviewName,
  OverviewParents,
  PersonRefData,
} from './overview-types';
import { Icon } from '../icon';
import { PersonRef } from './person-ref';

interface RecordRailProps {
  parents: OverviewParents;
  names: OverviewName[];
  media: OverviewMediaTile[];
  treeId: string;
}

/**
 * The left record rail: the parents panel, the names panel, and the media
 * panel. Pure `@radix-ui/themes`: `PersonRef` for parents, flat rows for names,
 * and a thumbnail grid (or empty state) for media.
 */
export function RecordRail({ parents, names, media, treeId }: RecordRailProps): JSX.Element {
  return (
    <Flex direction="column" gap="4">
      <ParentsPanel parents={parents} treeId={treeId} />
      <NamesPanel names={names} />
      <MediaPanel media={media} />
    </Flex>
  );
}

function ParentsPanel({
  parents,
  treeId,
}: {
  parents: OverviewParents;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.parents.title')}</Heading>
        {/* Always two fixed slots: father on top, mother below. Missing slots
            show a muted label + an "Add" button instead of a PersonRef. */}
        <Flex direction="column">
          <ParentSlot
            missingLabel={t('overview.parents.missingFather')}
            person={parents.father}
            treeId={treeId}
          />
          <Separator size="4" my="3" />
          <ParentSlot
            missingLabel={t('overview.parents.missingMother')}
            person={parents.mother}
            treeId={treeId}
          />
        </Flex>
      </Flex>
    </Card>
  );
}

interface ParentSlotProps {
  missingLabel: string;
  person?: PersonRefData;
  treeId: string;
}

function ParentSlot({ missingLabel, person, treeId }: ParentSlotProps): JSX.Element {
  if (person) {
    return <PersonRef person={person} treeId={treeId} />;
  }
  return (
    <Flex align="center" gap="2">
      <Icon name="user" size={14} color="var(--gray-7)" />
      <Text size="2" color="gray">
        {missingLabel}
      </Text>
    </Flex>
  );
}

function NamesPanel({ names }: { names: OverviewName[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.names.title')}</Heading>
        {/* Flat, separator-divided rows — same list pattern as Parents. */}
        <Flex direction="column">
          {names.map((name, i) => (
            <Flex key={name.id} direction="column">
              {i > 0 && <Separator size="4" my="3" />}
              <NameRow name={name} />
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}

function NameRow({ name }: { name: OverviewName }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="2">
        <Text size="1" color="gray">
          {t(`overview.names.types.${name.type}`)}
        </Text>
        {name.isPrimary && (
          <Text size="1" color="indigo">
            {t('overview.names.primary')}
          </Text>
        )}
      </Flex>
      <Text size="3">{name.text}</Text>
    </Flex>
  );
}

function MediaPanel({ media }: { media: OverviewMediaTile[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.media.title')}</Heading>
        {media.length === 0 ? (
          <Box px="3" py="5">
            <Text size="2" color="gray" align="center" as="div">
              {t('overview.media.empty')}
            </Text>
          </Box>
        ) : (
          <Grid columns="3" gap="2">
            {media.map((tile) => (
              <MediaTile key={tile.id} tile={tile} />
            ))}
          </Grid>
        )}
      </Flex>
    </Card>
  );
}

function MediaTile({ tile }: { tile: OverviewMediaTile }): JSX.Element {
  const { t } = useTranslation('individuals');
  // Caption still labels the image for assistive tech, just not shown visually.
  const caption = t(`overview.media.captions.${tile.caption}`);
  return (
    <Card size="1">
      <Inset>
        <img
          src={tile.imageUrl}
          alt={caption}
          style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover' }}
        />
      </Inset>
    </Card>
  );
}

import { Box, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewName, OverviewParents, PersonRefData } from './overview-types';
import { Icon } from '../icon';
import { PersonRef } from './person-ref';

interface RecordRailProps {
  parents: OverviewParents;
  names: OverviewName[];
  treeId: string;
}

/**
 * The left record rail: the parents panel, the names panel, and the media
 * panel. Pure `@radix-ui/themes`: `PersonRef` for parents, flat rows for names,
 * and an empty-state media panel (per-person media has no data model yet).
 */
export function RecordRail({ parents, names, treeId }: RecordRailProps): JSX.Element {
  return (
    <Flex direction="column" gap="4">
      <ParentsPanel parents={parents} treeId={treeId} />
      <NamesPanel names={names} />
      <MediaPanel />
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

function MediaPanel(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.media.title')}</Heading>
        <Box px="3" py="5">
          <Text size="2" color="gray" align="center" as="div">
            {t('overview.media.empty')}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}

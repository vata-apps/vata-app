import { Avatar, Badge, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { OverviewMilestone, PersonRefData } from './overview-types';
import { Icon } from '../icon';
import { PersonRef } from './person-ref';

/**
 * The life events — a person's key vital events (birth, marriages, death) in
 * one card, each a separator-divided row led by its (possibly imprecise) date
 * in a subtle gray `Badge`. Pure `@radix-ui/themes`: the PoC's custom timeline
 * rail and milestone glyph circles are dropped, as Radix has no primitive for
 * them.
 *
 * Born and death slots are always rendered — a blank state row with an "Add"
 * button appears when the event is not yet recorded.
 */
export function LifeSpine({
  milestones,
  treeId,
}: {
  milestones: OverviewMilestone[];
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  const hasBorn = milestones.some((m) => m.kind === 'born');
  const hasDeath = milestones.some((m) => m.kind === 'death');

  // Ordered list: born slot first, recorded milestones in the middle (excluding
  // born/death which have fixed positions), death slot last.
  type Row =
    | { type: 'milestone'; milestone: OverviewMilestone }
    | { type: 'missing'; kind: 'born' | 'death' };

  const rows: Row[] = [
    hasBorn
      ? { type: 'milestone', milestone: milestones.find((m) => m.kind === 'born')! }
      : { type: 'missing', kind: 'born' },
    ...milestones
      .filter((m) => m.kind !== 'born' && m.kind !== 'death')
      .map((m): Row => ({ type: 'milestone', milestone: m })),
    hasDeath
      ? { type: 'milestone', milestone: milestones.find((m) => m.kind === 'death')! }
      : { type: 'missing', kind: 'death' },
  ];

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.milestone.title')}</Heading>
        <Flex direction="column">
          {rows.map((row, i) => (
            <Flex
              key={row.type === 'milestone' ? row.milestone.id : `missing-${row.kind}`}
              direction="column"
            >
              {i > 0 && <Separator size="4" my="3" />}
              {row.type === 'milestone' ? (
                <Milestone milestone={row.milestone} treeId={treeId} />
              ) : (
                <MissingMilestone
                  label={t(`overview.milestone.missing${row.kind === 'born' ? 'Born' : 'Death'}`)}
                />
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}

function MissingMilestone({ label }: { label: string }): JSX.Element {
  return (
    <Flex align="center" gap="2">
      <Icon name="circle" size={14} style={{ color: 'var(--gray-7)' }} />
      <Text size="2" color="gray">
        {label}
      </Text>
    </Flex>
  );
}

function formatLifeDates(person: PersonRefData): string {
  if (person.bornYear !== undefined && person.deathYear !== undefined)
    return `b. ${person.bornYear} – ${person.deathYear}`;
  if (person.bornYear !== undefined) return `b. ${person.bornYear}`;
  if (person.deathYear !== undefined) return `d. ${person.deathYear}`;
  return '';
}

function SpouseInline({ spouse, treeId }: { spouse: PersonRefData; treeId: string }): JSX.Element {
  const dates = formatLifeDates(spouse);

  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: spouse.id }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Flex align="center" gap="2" flexShrink="0">
        <Avatar
          src={spouse.imageUrl}
          radius="full"
          size="1"
          variant="soft"
          fallback={spouse.initials}
        />
        <Text size="2" weight="medium">
          {spouse.name}
        </Text>
        {dates && (
          <Text size="1" color="gray">
            {dates}
          </Text>
        )}
      </Flex>
    </Link>
  );
}

function Milestone({
  milestone,
  treeId,
}: {
  milestone: OverviewMilestone;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  const title = t(`overview.milestone.${milestone.kind}`);

  const children = milestone.children ?? [];

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" gap="3" wrap="wrap">
        <Badge variant="soft" color="gray" radius="full" size="2">
          {milestone.date}
        </Badge>
        <Text size="3" weight="medium">
          {title}
        </Text>
        {milestone.spouse && <SpouseInline spouse={milestone.spouse} treeId={treeId} />}
        <Flex flexGrow="1" />
        <Flex align="center" gap="1" flexShrink="0">
          <Icon name="map-pin" size={14} style={{ color: 'var(--gray-9)' }} />
          <Text size="2" color="gray">
            {milestone.place}
          </Text>
        </Flex>
      </Flex>

      {children.length > 0 && (
        // Nesting cue: a vertical `Separator` spine + indent marks the children
        // as subordinate to their event, so the lighter `subtle` refs read as a
        // detail of the milestone rather than a peer block.
        <Flex ml="2" gap="3" align="stretch">
          <Separator orientation="vertical" size="4" style={{ height: 'auto' }} />
          <Flex direction="column" gap="2">
            <Text size="1" color="gray">
              {t('overview.milestone.children')}
            </Text>
            <Flex gap="3" wrap="wrap">
              {children.map((child) => (
                <PersonRef key={child.id} person={child} variant="subtle" treeId={treeId} />
              ))}
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

import { Avatar, Flex, Text } from '@radix-ui/themes';

import { IndividualLink } from './entity-links';
import type { PersonRefData } from './overview-types';

type PersonRefVariant = 'normal' | 'subtle';

interface PersonRefProps {
  person: PersonRefData;
  /** Tree whose individual route the reference links into. */
  treeId: string;
  /**
   * Visual weight of the same chrome-less avatar + name + life-dates layout.
   * `normal` — a solid avatar with the dates stacked under the name, for
   *   first-class references (e.g. parents).
   * `subtle` — lighter: a small soft gray avatar with the dates inline, for
   *   subordinate references (e.g. an event's children) that must not out-weigh
   *   their host.
   */
  variant?: PersonRefVariant;
}

/** Formats the life dates as "b. 1855 – 1921", "b. 1855", "d. 1921", or "". */
export function formatLifeDates(person: PersonRefData): string {
  const { bornYear, deathYear } = person;
  if (bornYear !== undefined && deathYear !== undefined) return `b. ${bornYear} – ${deathYear}`;
  if (bornYear !== undefined) return `b. ${bornYear}`;
  if (deathYear !== undefined) return `d. ${deathYear}`;
  return '';
}

/**
 * A clickable reference to another person, shared wherever the app shows a
 * related individual (parents, children, spouses, …). One chrome-less layout —
 * avatar, name, and life dates in a bare button — rendered at two weights via
 * {@link PersonRefVariant}:
 *
 * - `normal` — a solid avatar; the dates stack under the name.
 * - `subtle` — a smaller soft gray avatar with the dates running after the name
 *   inline, so subordinate references stay quiet.
 *
 * Neither draws a box: rows sit flat inside their host card (separator-divided,
 * like the Life events list) rather than nesting a card within a card.
 *
 * Activating the reference navigates to that person's individual page.
 *
 * Pure `@radix-ui/themes`.
 */
export function PersonRef({ person, treeId, variant = 'normal' }: PersonRefProps): JSX.Element {
  const subtle = variant === 'subtle';
  const dates = formatLifeDates(person);

  return (
    <IndividualLink treeId={treeId} individualId={person.id}>
      <Flex align="center" gap={subtle ? '2' : '3'}>
        <Avatar
          src={person.imageUrl}
          variant={subtle ? 'soft' : 'solid'}
          color={subtle ? 'gray' : undefined}
          radius="full"
          size={subtle ? '1' : '2'}
          fallback={person.initials}
        />
        <Flex
          direction={subtle ? 'row' : 'column'}
          align={subtle ? 'baseline' : 'start'}
          gap={subtle ? '2' : '0'}
        >
          <Text size={subtle ? '2' : '3'} color={subtle ? 'gray' : undefined} highContrast={subtle}>
            {person.name}
          </Text>
          {dates && (
            <Text size="1" color="gray">
              {dates}
            </Text>
          )}
        </Flex>
      </Flex>
    </IndividualLink>
  );
}

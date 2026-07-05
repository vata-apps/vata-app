import { Avatar, Flex, Text } from '@radix-ui/themes';

import { IndividualLink } from './entity-links';
import type { PersonRefData } from './overview-types';

type PersonRefVariant = 'normal' | 'subtle' | 'focal';

interface PersonRefProps {
  person: PersonRefData;
  /** Tree whose individual route the reference links into. */
  treeId: string;
  /**
   * Visual weight of the same chrome-less avatar + name + life-dates layout.
   * `normal` — a solid avatar, for first-class references (e.g. parents).
   * `subtle` — a soft gray avatar, for subordinate references (e.g. an
   *   event's children) that must not out-weigh their host.
   * `focal` — an accent-tinted avatar and name marking "you are here" (e.g.
   *   the subject inside their own Ancestors chart); not wrapped in a link,
   *   since it would only navigate to the page already open.
   */
  variant?: PersonRefVariant;
  /**
   * Compact shape: a smaller avatar with the dates running after the name
   * inline, instead of stacked below — for dense grids (e.g. every card in
   * the Ancestors chart). Independent of `variant`: `subtle` always implies
   * this shape; `compact` adds it to `normal`/`focal` without changing their
   * color.
   */
  compact?: boolean;
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
 * A reference to another person, shared wherever the app shows a related
 * individual (parents, children, spouses, …). One chrome-less layout —
 * avatar, name, and life dates — rendered at three weights via
 * {@link PersonRefVariant}, each optionally in a {@link PersonRefProps.compact}
 * shape:
 *
 * - `normal` — a solid avatar; the dates stack under the name. Clickable.
 * - `subtle` — a smaller soft gray avatar with the dates running after the name
 *   inline (always compact), so subordinate references stay quiet. Clickable.
 * - `focal` — an indigo-tinted avatar and name marking the subject themselves;
 *   not clickable, since it would only navigate to the page already open.
 *
 * Draws no box of its own: rows sit flat inside their host (separator-divided,
 * like the Life events list) or inside a host-provided card (the Ancestors
 * chart wraps each one in a `Card` for its grid of nodes).
 *
 * Activating a `normal` or `subtle` reference navigates to that person's
 * individual page.
 *
 * Pure `@radix-ui/themes`.
 */
export function PersonRef({
  person,
  treeId,
  variant = 'normal',
  compact = false,
}: PersonRefProps): JSX.Element {
  const subtle = variant === 'subtle';
  const focal = variant === 'focal';
  const dense = subtle || compact;
  const dates = formatLifeDates(person);
  const accentColor = focal ? 'indigo' : undefined;
  const color = subtle ? 'gray' : accentColor;

  const content = (
    <Flex align="center" gap={dense ? '2' : '3'}>
      <Avatar
        src={person.imageUrl}
        variant={subtle ? 'soft' : 'solid'}
        color={color}
        radius="full"
        size={dense ? '1' : '2'}
        fallback={person.initials}
      />
      <Flex
        direction={dense ? 'row' : 'column'}
        align={dense ? 'baseline' : 'start'}
        gap={dense ? '2' : '0'}
      >
        <Text size={dense ? '2' : '3'} color={color} highContrast={subtle || focal}>
          {person.name}
        </Text>
        {dates && (
          <Text size="1" color="gray">
            {dates}
          </Text>
        )}
      </Flex>
    </Flex>
  );

  if (focal) return content;

  return (
    <IndividualLink treeId={treeId} individualId={person.id}>
      {content}
    </IndividualLink>
  );
}

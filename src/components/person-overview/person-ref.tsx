import { Avatar } from '../ui/avatar';
import { Typography } from '../ui/typography';
import { IndividualLink } from './entity-links';
import type { PersonRefData } from './overview-types';
import * as s from './person-ref.css';

type PersonRefVariant = 'normal' | 'subtle' | 'focal';

/** Name color per variant: quiet for subordinate refs, accent for the focal (self) one. */
const NAME_TONE: Record<PersonRefVariant, 'text' | 'muted' | 'accent'> = {
  normal: 'text',
  subtle: 'muted',
  focal: 'accent',
};

interface PersonRefProps {
  person: PersonRefData;
  /** Tree whose individual route the reference links into. */
  treeId: string;
  /**
   * Visual weight of the same chrome-less avatar + name + life-dates layout.
   * `normal` — an accent-toned avatar, for first-class references (e.g. parents).
   * `subtle` — a muted gray avatar, for subordinate references (e.g. an
   *   event's children) that must not out-weigh their host.
   * `focal` — an accent name marking "you are here" (e.g. the subject inside
   *   their own Ancestors chart); not wrapped in a link, since it would only
   *   navigate to the page already open.
   */
  variant?: PersonRefVariant;
  /**
   * Compact shape: a smaller avatar with the dates running after the name
   * inline, instead of stacked below — for dense grids (e.g. every card in
   * the Ancestors chart). Independent of `variant`: `subtle` always implies
   * this shape; `compact` adds it to `normal`/`focal` without changing their
   * tone.
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
 * - `normal` — an accent-toned avatar; the dates stack under the name. Clickable.
 * - `subtle` — a smaller muted avatar with the dates running after the name
 *   inline (always compact), so subordinate references stay quiet. Clickable.
 * - `focal` — an accent-colored name marking the subject themselves; not
 *   clickable, since it would only navigate to the page already open.
 *
 * Draws no box of its own: rows sit flat inside their host (separator-divided,
 * like the Life events list) or inside a host-provided `Card` (the Ancestors
 * chart wraps each one in a `Card` for its grid of nodes).
 *
 * Activating a `normal` or `subtle` reference navigates to that person's
 * individual page.
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

  const content = (
    <div className={dense ? s.rowDense : s.row}>
      <Avatar.Root size={dense ? 'sm' : 'md'} tone={subtle ? 'neutral' : 'accent'}>
        <Avatar.Image src={person.imageUrl} alt="" />
        <Avatar.Fallback>{person.initials}</Avatar.Fallback>
      </Avatar.Root>
      <div className={dense ? s.bodyDense : s.body}>
        <Typography
          size={dense ? '13' : '15'}
          weight={focal ? '650' : '550'}
          tone={NAME_TONE[variant]}
        >
          {person.name}
        </Typography>
        {dates && (
          <Typography size="12.5" tone="faint">
            {dates}
          </Typography>
        )}
      </div>
    </div>
  );

  if (focal) return content;

  return (
    <IndividualLink treeId={treeId} individualId={person.id}>
      {content}
    </IndividualLink>
  );
}

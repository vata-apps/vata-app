import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '$components/ui/segmented-control';

/**
 * The graduated scope filter for a person's Events tab. Each level is
 * cumulative:
 * - `principal` — the person's own principal events only.
 * - `personal` — adds their unions (marriages, divorces).
 * - `all` — adds their secondary roles in others' events (witness, …).
 */
export type PersonEventScope = 'principal' | 'personal' | 'all';

/** The default scope — shows principal events plus unions. */
export const DEFAULT_PERSON_EVENT_SCOPE: PersonEventScope = 'personal';

/** Props accepted by {@link PersonEventsFilterToolbar}. */
export interface PersonEventsFilterToolbarProps {
  /** The current scope value (the page owns this state). */
  value: PersonEventScope;
  /** Called with the next scope value on any control change. */
  onChange: (next: PersonEventScope) => void;
}

/**
 * The Person Events tab filter toolbar. Holds the cumulative scope control.
 */
export function PersonEventsFilterToolbar({
  value,
  onChange,
}: PersonEventsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <SegmentedControl
        aria-label={t('events.scope.label')}
        value={value}
        onValueChange={onChange}
        options={[
          { value: 'principal', label: t('events.scope.principal') },
          { value: 'personal', label: t('events.scope.personal') },
          { value: 'all', label: t('events.scope.all') },
        ]}
      />
    </div>
  );
}

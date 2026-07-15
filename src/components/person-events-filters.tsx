import { useTranslation } from 'react-i18next';

import { Chip } from '$components/ui/chip';
import { SegmentedControl } from '$components/ui/segmented-control';
import { Button } from '$components/ui/button';
import { Icon } from '$components/icon';

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

/** Whether the scope is currently narrowed away from the default. */
export function hasActiveScope(scope: PersonEventScope): boolean {
  return scope !== DEFAULT_PERSON_EVENT_SCOPE;
}

/** Props accepted by {@link PersonEventsFilterToolbar}. */
export interface PersonEventsFilterToolbarProps {
  /** The current scope value (the page owns this state). */
  value: PersonEventScope;
  /** Called with the next scope value on any control change. */
  onChange: (next: PersonEventScope) => void;
}

/**
 * The Person Events tab filter toolbar. Holds the cumulative scope control and
 * a dismissible chip when the scope is not at its default. A Clear-all button
 * appears only while the scope is narrowed.
 */
export function PersonEventsFilterToolbar({
  value,
  onChange,
}: PersonEventsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveScope(value);

  const scopeDisplay = t(`events.scope.${value}`);

  const scopeChipLabel = `${t('events.scope.label')}: ${scopeDisplay}`;

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

      {active && (
        <>
          <Chip
            key="scope"
            label={scopeChipLabel}
            removeAriaLabel={tCommon('filters.removeAria', { label: scopeChipLabel })}
            onRemove={() => onChange(DEFAULT_PERSON_EVENT_SCOPE)}
          />
          <Button variant="ghost" onClick={() => onChange(DEFAULT_PERSON_EVENT_SCOPE)}>
            <Icon name="x" size={14} />
            {tCommon('filters.clear')}
          </Button>
        </>
      )}
    </div>
  );
}

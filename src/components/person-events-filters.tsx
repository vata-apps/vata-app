import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '$components/ui/segmented-control';

/**
 * Which of a person's events are shown: all of them, only their own "vie
 * personnelle" (principal events and unions — their own vital records and
 * marriages), or only "autres rôles" (secondary roles in someone else's
 * event: witness, informant, godparent, …).
 */
export type PersonEventFilter = 'all' | 'personal' | 'other';

export interface PersonEventsFilterToolbarProps {
  /** The current filter value (the page owns this state). */
  value: PersonEventFilter;
  /** Called with the next filter value on any control change. */
  onChange: (next: PersonEventFilter) => void;
}

/** The Person Events tab filter toolbar. Holds the Tous/Vie personnelle/Autres rôles control. */
export function PersonEventsFilterToolbar({
  value,
  onChange,
}: PersonEventsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <SegmentedControl
      aria-label={t('eventsTab.filter.label')}
      value={value}
      onValueChange={onChange}
      options={[
        { value: 'all', label: t('eventsTab.filter.all') },
        { value: 'personal', label: t('eventsTab.filter.personal') },
        { value: 'other', label: t('eventsTab.filter.other') },
      ]}
    />
  );
}

import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '$components/ui/segmented-control';

/** Which scope card(s) are shown: all of them, or only the person/event/relation notes. */
export type PersonNoteFilter = 'all' | 'person' | 'event' | 'relation';

export interface PersonNotesFilterToolbarProps {
  /** The current filter value (the page owns this state). */
  value: PersonNoteFilter;
  /** Called with the next filter value on any control change. */
  onChange: (next: PersonNoteFilter) => void;
}

/** The Person Notes tab filter toolbar. Holds the Toutes/Personne/Événements/Liens control. */
export function PersonNotesFilterToolbar({
  value,
  onChange,
}: PersonNotesFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <SegmentedControl
      aria-label={t('notesTab.filter.label')}
      value={value}
      onValueChange={onChange}
      options={[
        { value: 'all', label: t('notesTab.filter.all') },
        { value: 'person', label: t('notesTab.filter.person') },
        { value: 'event', label: t('notesTab.filter.event') },
        { value: 'relation', label: t('notesTab.filter.relation') },
      ]}
    />
  );
}

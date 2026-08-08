import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '$components/ui/segmented-control';

/** Which of a person's names are shown: all of them, only the primary one, or the rest. */
export type PersonNameFilter = 'all' | 'primary' | 'secondary';

export interface PersonNamesFilterToolbarProps {
  /** The current filter value (the page owns this state). */
  value: PersonNameFilter;
  /** Called with the next filter value on any control change. */
  onChange: (next: PersonNameFilter) => void;
}

/** The Person Names tab filter toolbar. Holds the Tous/Principal/Secondaires control. */
export function PersonNamesFilterToolbar({
  value,
  onChange,
}: PersonNamesFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <SegmentedControl
      aria-label={t('namesTab.filter.label')}
      value={value}
      onValueChange={onChange}
      options={[
        { value: 'all', label: t('namesTab.filter.all') },
        { value: 'primary', label: t('overview.names.primary') },
        { value: 'secondary', label: t('namesTab.filter.secondary') },
      ]}
    />
  );
}

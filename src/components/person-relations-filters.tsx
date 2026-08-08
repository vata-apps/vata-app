import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '$components/ui/segmented-control';

/** Which of a person's relations are shown: all of them, only parents/siblings, or only spouses/children (per union). */
export type PersonRelationFilter = 'all' | 'origin' | 'unions';

export interface PersonRelationsFilterToolbarProps {
  /** The current filter value (the page owns this state). */
  value: PersonRelationFilter;
  /** Called with the next filter value on any control change. */
  onChange: (next: PersonRelationFilter) => void;
}

/** The Person Relations tab filter toolbar. Holds the Tous/Parents et fratrie/Conjoints et enfants control. */
export function PersonRelationsFilterToolbar({
  value,
  onChange,
}: PersonRelationsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <SegmentedControl
      aria-label={t('relationsTab.filter.label')}
      value={value}
      onValueChange={onChange}
      options={[
        { value: 'all', label: t('relationsTab.filter.all') },
        { value: 'origin', label: t('relationsTab.filter.origin') },
        { value: 'unions', label: t('relationsTab.filter.unions') },
      ]}
    />
  );
}

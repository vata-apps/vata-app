import { useTranslation } from 'react-i18next';

import { Select } from '$components/ui/select';
import { TextField } from '$components/ui/text-field';
import { Button } from '$components/ui/button';
import { Icon } from '$components/icon';

/** The set of filters applied to the Families list, all combined with AND. */
export interface FamilyFilters {
  /** Free-text query matched against both spouses' names (given + surname). */
  name: string;
  /** Restrict by which spouse slots are filled, or `'all'` for no restriction. */
  spouses: 'all' | 'both' | 'missingHusband' | 'missingWife' | 'none';
  /** Restrict by whether the family has children, or `'all'` for no restriction. */
  children: 'all' | 'with' | 'without';
}

/** The neutral state — no filtering. Also the target of the Clear action. */
export const DEFAULT_FAMILY_FILTERS: FamilyFilters = {
  name: '',
  spouses: 'all',
  children: 'all',
};

/**
 * Whether any filter is set away from its default. Drives the visibility of
 * the Clear affordance and the choice of empty-state copy.
 */
export function hasActiveFilters(filters: FamilyFilters): boolean {
  return filters.name.trim() !== '' || filters.spouses !== 'all' || filters.children !== 'all';
}

/** Props accepted by {@link FamiliesFilterToolbar}. */
export interface FamiliesFilterToolbarProps {
  /** The current filter values (the page owns this state). */
  value: FamilyFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: FamilyFilters) => void;
}

/**
 * The Families-list filter toolbar. Replaces the permanent left sidebar with a
 * compact horizontal bar above the table: a debounced name search, a
 * spouse-completeness select, and a has-children select. A Clear-all button
 * appears only while at least one filter is active.
 */
export function FamiliesFilterToolbar({
  value,
  onChange,
}: FamiliesFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('families');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveFilters(value);

  const spousesDisplay =
    value.spouses === 'all' ? t('filters.spouses.all') : t(`filters.spouses.${value.spouses}`);
  const childrenDisplay =
    value.children === 'all' ? t('filters.children.all') : t(`filters.children.${value.children}`);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ position: 'relative', width: 260 }}>
        <Icon
          name="search"
          size={16}
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
        />
        <TextField
          value={value.name}
          placeholder={t('filters.name.placeholder')}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          style={{ paddingLeft: 34 }}
          aria-label={t('filters.name.label')}
        />
      </div>

      <div style={{ width: 180 }}>
        <Select.Root
          value={value.spouses}
          onValueChange={(next) =>
            onChange({ ...value, spouses: (next ?? 'all') as FamilyFilters['spouses'] })
          }
        >
          <Select.Trigger aria-label={t('filters.spouses.label')}>
            <span>{spousesDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={14} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.spouses.all')}</Select.Item>
                <Select.Item value="both">{t('filters.spouses.both')}</Select.Item>
                <Select.Item value="missingHusband">
                  {t('filters.spouses.missingHusband')}
                </Select.Item>
                <Select.Item value="missingWife">{t('filters.spouses.missingWife')}</Select.Item>
                <Select.Item value="none">{t('filters.spouses.none')}</Select.Item>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      <div style={{ width: 160 }}>
        <Select.Root
          value={value.children}
          onValueChange={(next) =>
            onChange({ ...value, children: (next ?? 'all') as FamilyFilters['children'] })
          }
        >
          <Select.Trigger aria-label={t('filters.children.label')}>
            <span>{childrenDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={14} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.children.all')}</Select.Item>
                <Select.Item value="with">{t('filters.children.with')}</Select.Item>
                <Select.Item value="without">{t('filters.children.without')}</Select.Item>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      {active && (
        <Button variant="ghost" onClick={() => onChange(DEFAULT_FAMILY_FILTERS)}>
          <Icon name="x" size={14} />
          {tCommon('filters.clear')}
        </Button>
      )}
    </div>
  );
}

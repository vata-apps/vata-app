import { useTranslation } from 'react-i18next';

import { Chip } from '$components/ui/chip';
import { Select } from '$components/ui/select';
import { TextField } from '$components/ui/text-field';
import { Button } from '$components/ui/button';
import { Icon } from '$components/icon';

/** The set of filters applied to the Places list, all combined with AND. */
export interface PlaceFilters {
  /** Free-text query matched against the name and the full hierarchical name. */
  name: string;
  /** Restrict to a single place-type id, or `'all'` for no restriction. */
  type: string;
}

/** The neutral state — no filtering. Also the target of the Clear action. */
export const DEFAULT_PLACE_FILTERS: PlaceFilters = {
  name: '',
  type: 'all',
};

/**
 * Whether any filter is set away from its default. Drives the visibility of
 * the Clear affordance and the choice of empty-state copy.
 */
export function hasActiveFilters(filters: PlaceFilters): boolean {
  return filters.name.trim() !== '' || filters.type !== 'all';
}

/** A selectable place-type option for the Type filter. */
export interface PlaceTypeOption {
  /** The place-type id used as the filter value. */
  value: string;
  /** The user-visible label. */
  label: string;
}

/** Props accepted by {@link PlacesFilterToolbar}. */
export interface PlacesFilterToolbarProps {
  /** The current filter values (the page owns this state). */
  value: PlaceFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: PlaceFilters) => void;
  /** The place types present in the tree, offered in the Type select. */
  types: PlaceTypeOption[];
}

/**
 * The Places-list filter toolbar. Replaces the permanent left sidebar with a
 * compact horizontal bar above the table: a debounced name search, a place-type
 * select, and one dismissible chip per active filter. A Clear-all button
 * appears only while at least one filter is active.
 */
export function PlacesFilterToolbar({
  value,
  onChange,
  types,
}: PlacesFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveFilters(value);

  const typeOption = types.find((option) => option.value === value.type);
  const typeDisplay = typeOption?.label ?? t('filters.type.all');

  const chips: JSX.Element[] = [];
  if (value.name.trim()) {
    const label = `${t('filters.name.label')}: ${value.name.trim()}`;
    chips.push(
      <Chip
        key="name"
        label={label}
        removeAriaLabel={tCommon('filters.removeAria', { label })}
        onRemove={() => onChange({ ...value, name: '' })}
      />
    );
  }
  if (value.type !== 'all') {
    const label = `${t('filters.type.label')}: ${typeDisplay}`;
    chips.push(
      <Chip
        key="type"
        label={label}
        removeAriaLabel={tCommon('filters.removeAria', { label })}
        onRemove={() => onChange({ ...value, type: 'all' })}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ position: 'relative', width: 240 }}>
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
          value={value.type}
          onValueChange={(next) => onChange({ ...value, type: next ?? 'all' })}
        >
          <Select.Trigger aria-label={t('filters.type.label')}>
            <span>{typeDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={14} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.type.all')}</Select.Item>
                {types.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {chips}
        </div>
      )}

      {active && (
        <Button variant="ghost" onClick={() => onChange(DEFAULT_PLACE_FILTERS)}>
          <Icon name="x" size={14} />
          {tCommon('filters.clear')}
        </Button>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';

import { Chip } from '$components/ui/chip';
import { Select } from '$components/ui/select';
import { Button } from '$components/ui/button';
import { Icon } from '$components/icon';

/** The set of filters applied to the Events list, all combined with AND. */
export interface EventFilters {
  /** Restrict to a single event-type id, or `'all'` for no restriction. */
  type: string;
  /** Restrict to a single place id, or `'all'` for no restriction. */
  place: string;
}

/** The neutral state — no filtering. Also the target of the Clear action. */
export const DEFAULT_EVENT_FILTERS: EventFilters = {
  type: 'all',
  place: 'all',
};

/**
 * Whether any filter is set away from its default. Drives the visibility of
 * the Clear affordance and the choice of empty-state copy.
 */
export function hasActiveFilters(filters: EventFilters): boolean {
  return filters.type !== 'all' || filters.place !== 'all';
}

/** A selectable option for the Type and Place selects. */
export interface EventFilterOption {
  /** The id used as the filter value. */
  value: string;
  /** The user-visible label. */
  label: string;
}

/** Props accepted by {@link EventsFilterToolbar}. */
export interface EventsFilterToolbarProps {
  /** The current filter values (the page owns this state). */
  value: EventFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: EventFilters) => void;
  /** The event types present in the tree, offered in the Type select. */
  types: EventFilterOption[];
  /** The places present on the events, offered in the Place select. */
  places: EventFilterOption[];
}

/**
 * The Events-list filter toolbar. Replaces the permanent left sidebar with a
 * compact horizontal bar above the table: an event-type select, a place select,
 * and one dismissible chip per active filter. A Clear-all button appears only
 * while at least one filter is active.
 */
export function EventsFilterToolbar({
  value,
  onChange,
  types,
  places,
}: EventsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveFilters(value);

  const typeOption = types.find((option) => option.value === value.type);
  const typeDisplay = typeOption?.label ?? t('filters.type.all');
  const placeOption = places.find((option) => option.value === value.place);
  const placeDisplay = placeOption?.label ?? t('filters.place.all');

  const chips: JSX.Element[] = [];
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
  if (value.place !== 'all') {
    const label = `${t('filters.place.label')}: ${placeDisplay}`;
    chips.push(
      <Chip
        key="place"
        label={label}
        removeAriaLabel={tCommon('filters.removeAria', { label })}
        onRemove={() => onChange({ ...value, place: 'all' })}
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
      <div style={{ width: 200 }}>
        <Select.Root
          value={value.type}
          onValueChange={(next) => onChange({ ...value, type: next ?? 'all' })}
        >
          <Select.Trigger aria-label={t('filters.type.label')}>
            <span>{typeDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={12} />
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

      <div style={{ width: 200 }}>
        <Select.Root
          value={value.place}
          onValueChange={(next) => onChange({ ...value, place: next ?? 'all' })}
        >
          <Select.Trigger aria-label={t('filters.place.label')}>
            <span>{placeDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.place.all')}</Select.Item>
                {places.map((option) => (
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
        <Button variant="ghost" onClick={() => onChange(DEFAULT_EVENT_FILTERS)}>
          <Icon name="x" size={14} />
          {tCommon('filters.clear')}
        </Button>
      )}
    </div>
  );
}

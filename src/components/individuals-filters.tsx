import { useTranslation } from 'react-i18next';

import { Chip } from '$components/ui/chip';
import { Select } from '$components/ui/select';
import { TextField } from '$components/ui/text-field';
import { Button } from '$components/ui/button';
import { Icon } from '$components/icon';
import type { Gender } from '$types/database';

/** The set of filters applied to the People list, all combined with AND. */
export interface IndividualFilters {
  /** Free-text query matched against every name (given names + surname). */
  name: string;
  /** Restrict to a single sex, or `'all'` for no restriction. */
  sex: Gender | 'all';
  /** Restrict by living status, or `'all'` for no restriction. */
  status: 'all' | 'living' | 'deceased';
}

/** The neutral state — no filtering. Also the target of the Clear action. */
export const DEFAULT_INDIVIDUAL_FILTERS: IndividualFilters = {
  name: '',
  sex: 'all',
  status: 'all',
};

/**
 * Whether any filter is set away from its default. Drives the visibility of
 * the Clear affordance and the choice of empty-state copy.
 */
export function hasActiveFilters(filters: IndividualFilters): boolean {
  return filters.name.trim() !== '' || filters.sex !== 'all' || filters.status !== 'all';
}

/** Props accepted by {@link IndividualsFilterToolbar}. */
export interface IndividualsFilterToolbarProps {
  /** The current filter values (the page owns this state). */
  value: IndividualFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: IndividualFilters) => void;
}

/**
 * The People-list filter toolbar. Replaces the permanent left sidebar with a
 * compact horizontal bar above the table: a debounced name search, a sex
 * select, a living-status select, and one dismissible chip per active filter.
 * A Clear-all button appears only while at least one filter is active.
 */
export function IndividualsFilterToolbar({
  value,
  onChange,
}: IndividualsFilterToolbarProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveFilters(value);

  const sexDisplay = value.sex === 'all' ? t('filters.sex.all') : t(`table.sex.${value.sex}`);
  const statusDisplay =
    value.status === 'all' ? t('filters.status.all') : t(`filters.status.${value.status}`);

  const chips: JSX.Element[] = [];
  if (value.name.trim()) {
    chips.push(
      <Chip
        key="name"
        label={`${t('filters.name.label')}: ${value.name.trim()}`}
        onRemove={() => onChange({ ...value, name: '' })}
      />
    );
  }
  if (value.sex !== 'all') {
    chips.push(
      <Chip
        key="sex"
        label={`${t('filters.sex.label')}: ${sexDisplay}`}
        onRemove={() => onChange({ ...value, sex: 'all' })}
      />
    );
  }
  if (value.status !== 'all') {
    chips.push(
      <Chip
        key="status"
        label={`${t('filters.status.label')}: ${statusDisplay}`}
        onRemove={() => onChange({ ...value, status: 'all' })}
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

      <div style={{ width: 140 }}>
        <Select.Root
          value={value.sex}
          onValueChange={(next) => onChange({ ...value, sex: next as IndividualFilters['sex'] })}
        >
          <Select.Trigger aria-label={t('filters.sex.label')}>
            <span>{sexDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.sex.all')}</Select.Item>
                <Select.Item value="M">{t('table.sex.M')}</Select.Item>
                <Select.Item value="F">{t('table.sex.F')}</Select.Item>
                <Select.Item value="U">{t('table.sex.U')}</Select.Item>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>

      <div style={{ width: 150 }}>
        <Select.Root
          value={value.status}
          onValueChange={(next) =>
            onChange({ ...value, status: next as IndividualFilters['status'] })
          }
        >
          <Select.Trigger aria-label={t('filters.status.label')}>
            <span>{statusDisplay}</span>
            <Select.Icon>
              <Icon name="chevron-down" size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="all">{t('filters.status.all')}</Select.Item>
                <Select.Item value="living">{t('filters.status.living')}</Select.Item>
                <Select.Item value="deceased">{t('filters.status.deceased')}</Select.Item>
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
        <Button variant="ghost" onClick={() => onChange(DEFAULT_INDIVIDUAL_FILTERS)}>
          <Icon name="x" size={14} />
          {tCommon('filters.clear')}
        </Button>
      )}
    </div>
  );
}

import { Button, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

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

/** Props accepted by {@link PlacesFilters}. */
export interface PlacesFiltersProps {
  /** The current filter values (the page owns this state). */
  value: PlaceFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: PlaceFilters) => void;
  /** The place types present in the tree, offered in the Type select. */
  types: PlaceTypeOption[];
}

/**
 * The Places-list filter card. A controlled component: it renders a name
 * search (matched against the name and full name) and a place-type select,
 * reporting edits through `onChange`. A Clear button appears only while at
 * least one filter is active.
 *
 * Filtering itself happens in the page over the already-loaded list; this
 * component holds no state of its own.
 */
export function PlacesFilters({ value, onChange, types }: PlacesFiltersProps): JSX.Element {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const active = hasActiveFilters(value);

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Heading size="3">{tCommon('filters.title')}</Heading>
          {active && (
            <Button
              variant="ghost"
              size="1"
              color="gray"
              onClick={() => onChange(DEFAULT_PLACE_FILTERS)}
            >
              <Icon name="x" />
              {tCommon('filters.clear')}
            </Button>
          )}
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t('filters.name.label')}
          </Text>
          <TextField.Root
            value={value.name}
            placeholder={t('filters.name.placeholder')}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
          >
            <TextField.Slot>
              <Icon name="search" />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t('filters.type.label')}
          </Text>
          <Select.Root
            value={value.type}
            onValueChange={(next) => onChange({ ...value, type: next })}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.type.all')}</Select.Item>
              {types.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>
    </Card>
  );
}

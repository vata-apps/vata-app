import { Button, Card, Flex, Heading, Select, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

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

/** Props accepted by {@link EventsFilters}. */
export interface EventsFiltersProps {
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
 * The Events-list filter card. A controlled component: it renders an
 * event-type select and a place select — both populated from the values
 * actually present in the loaded events — and reports edits through
 * `onChange`. A Clear button appears only while at least one filter is active.
 *
 * Filtering itself happens in the page over the already-loaded list; this
 * component holds no state of its own.
 */
export function EventsFilters({ value, onChange, types, places }: EventsFiltersProps): JSX.Element {
  const { t } = useTranslation('events');
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
              onClick={() => onChange(DEFAULT_EVENT_FILTERS)}
            >
              <Icon name="x" />
              {tCommon('filters.clear')}
            </Button>
          )}
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

        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t('filters.place.label')}
          </Text>
          <Select.Root
            value={value.place}
            onValueChange={(next) => onChange({ ...value, place: next })}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.place.all')}</Select.Item>
              {places.map((option) => (
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

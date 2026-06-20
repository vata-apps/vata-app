import { Button, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

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

/** Props accepted by {@link IndividualsFilters}. */
export interface IndividualsFiltersProps {
  /** The current filter values (the page owns this state). */
  value: IndividualFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: IndividualFilters) => void;
}

/**
 * The People-list filter card. A controlled component: it renders the three
 * filters the backend can express — a name search (matched against every
 * name), sex, and living status — and reports edits through `onChange`. A
 * Clear button appears only while at least one filter is active.
 *
 * Filtering itself happens in the page over the already-loaded list; this
 * component holds no state of its own.
 */
export function IndividualsFilters({ value, onChange }: IndividualsFiltersProps): JSX.Element {
  const { t } = useTranslation('individuals');
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
              onClick={() => onChange(DEFAULT_INDIVIDUAL_FILTERS)}
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
            {t('filters.sex.label')}
          </Text>
          <Select.Root
            value={value.sex}
            onValueChange={(next) => onChange({ ...value, sex: next as IndividualFilters['sex'] })}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.sex.all')}</Select.Item>
              <Select.Item value="M">{t('table.sex.M')}</Select.Item>
              <Select.Item value="F">{t('table.sex.F')}</Select.Item>
              <Select.Item value="U">{t('table.sex.U')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t('filters.status.label')}
          </Text>
          <Select.Root
            value={value.status}
            onValueChange={(next) =>
              onChange({ ...value, status: next as IndividualFilters['status'] })
            }
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.status.all')}</Select.Item>
              <Select.Item value="living">{t('filters.status.living')}</Select.Item>
              <Select.Item value="deceased">{t('filters.status.deceased')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>
    </Card>
  );
}

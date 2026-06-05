import { Button, Card, Flex, Heading, Select, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

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

/** Props accepted by {@link FamiliesFilters}. */
export interface FamiliesFiltersProps {
  /** The current filter values (the page owns this state). */
  value: FamilyFilters;
  /** Called with the next filter values on any control change. */
  onChange: (next: FamilyFilters) => void;
}

/**
 * The Families-list filter card. A controlled component: it renders a name
 * search (matched against both spouses' names), a spouse-completeness select,
 * and a has-children select, reporting edits through `onChange`. A Clear
 * button appears only while at least one filter is active.
 *
 * Filtering itself happens in the page over the already-loaded list; this
 * component holds no state of its own.
 */
export function FamiliesFilters({ value, onChange }: FamiliesFiltersProps): JSX.Element {
  const { t } = useTranslation('families');
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
              onClick={() => onChange(DEFAULT_FAMILY_FILTERS)}
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
            {t('filters.spouses.label')}
          </Text>
          <Select.Root
            value={value.spouses}
            onValueChange={(next) =>
              onChange({ ...value, spouses: next as FamilyFilters['spouses'] })
            }
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.spouses.all')}</Select.Item>
              <Select.Item value="both">{t('filters.spouses.both')}</Select.Item>
              <Select.Item value="missingHusband">
                {t('filters.spouses.missingHusband')}
              </Select.Item>
              <Select.Item value="missingWife">{t('filters.spouses.missingWife')}</Select.Item>
              <Select.Item value="none">{t('filters.spouses.none')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="1" color="gray">
            {t('filters.children.label')}
          </Text>
          <Select.Root
            value={value.children}
            onValueChange={(next) =>
              onChange({ ...value, children: next as FamilyFilters['children'] })
            }
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">{t('filters.children.all')}</Select.Item>
              <Select.Item value="with">{t('filters.children.with')}</Select.Item>
              <Select.Item value="without">{t('filters.children.without')}</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>
    </Card>
  );
}

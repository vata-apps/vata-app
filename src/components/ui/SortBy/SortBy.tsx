import { Icon } from '$/components/icon';
import { SortDirection } from '$/types/sort';
import { Select } from '@base-ui/react';
import { props } from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { styles } from './SortBy.styles';

export interface SortValue<Column> {
  column: Column;
  direction: SortDirection;
}

export interface SortProps<Column> {
  column: Column;
  direction: SortDirection;
  onChange: ({ column, direction }: SortValue<Column>) => void;
}

export interface SortOption<Column extends string = string> extends SortValue<Column> {
  label: string;
}

export interface SortByProps<Column extends string = string> extends SortValue<Column> {
  onChange: ({ column, direction }: SortValue<Column>) => void;
  options: readonly SortOption<Column>[];
  column: Column;
  direction: SortDirection;
}

function formatValue<Column>({ column, direction }: SortValue<Column>) {
  return `${column}-${direction}`;
}

function extractValue<Column>(value: string) {
  const [column, direction] = value.split('-');
  if (!column || !direction) throw new Error();
  return { column, direction } as SortValue<Column>;
}

export function SortBy<const Column extends string>({
  onChange,
  options,
  column,
  direction,
}: SortByProps<Column>) {
  const { t } = useTranslation('common');

  const value = formatValue({ column, direction });

  const formattedOptions = options.map(({ label, ...values }) => ({
    label,
    value: formatValue(values),
  }));

  function handleValueChange(value: string | null) {
    // TODO: Handle this. Is it even possible?
    if (!value) throw new Error();
    onChange(extractValue<Column>(value));
  }

  return (
    <div {...props(styles.root)}>
      <Select.Root items={formattedOptions} value={value} onValueChange={handleValueChange}>
        <Select.Label {...props(styles.label)}>{t('sort.label')}</Select.Label>
        <Select.Trigger {...props(styles.trigger)}>
          <Select.Value {...props(styles.value)} />
          <Select.Icon {...props(styles.icon)}>
            <Icon name="chevron-down" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner
            alignItemWithTrigger={false}
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <Select.Popup {...props(styles.popup)}>
              <Select.List {...props(styles.list)}>
                {options.map(({ label: labelKey, ...values }) => (
                  <Select.Item
                    key={formatValue(values)}
                    value={formatValue(values)}
                    {...props(styles.item)}
                  >
                    <Select.ItemText>{labelKey}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

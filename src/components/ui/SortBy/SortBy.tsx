import { Icon } from '$/components/icon';
import { Select } from '@base-ui/react';
import { props } from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { styles } from './SortBy.styles';

interface SortByOption<Value extends string = string> {
  value: Value;
  label: string;
}

export interface SortByProps<Value extends string = string> {
  onChange: (value: Value | null) => void;
  options: readonly SortByOption<Value>[];
  value: NoInfer<Value> | null;
}

export function SortBy<const Value extends string>({
  onChange,
  options,
  value,
}: SortByProps<Value>) {
  const { t } = useTranslation('common');

  return (
    <div {...props(styles.root)}>
      <Select.Root items={options} value={value} onValueChange={onChange}>
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
                {options.map(({ label, value }) => (
                  <Select.Item key={value} value={value} {...props(styles.item)}>
                    <Select.ItemIndicator {...props(styles.itemIndicator)}>
                      <Icon name="check" size={12} />
                    </Select.ItemIndicator>
                    <Select.ItemText>{label}</Select.ItemText>
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

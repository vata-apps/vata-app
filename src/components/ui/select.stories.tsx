import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { Select } from './select';

const meta = {
  title: 'UI/Select',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Select assembly. Same parts as Base UI (`Root`, `Trigger`, ' +
          '`Value`, `Icon`, `Portal`, `Positioner`, `Popup`, `Item`, `ItemText`) with the ' +
          'grayscale trigger, popup and item styles.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

const EVENT_TYPES = [
  { value: 'birth', label: 'Birth' },
  { value: 'baptism', label: 'Baptism' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'death', label: 'Death' },
  { value: 'burial', label: 'Burial' },
];

function EventTypeSelect({ disabled }: { disabled?: boolean }) {
  const [value, setValue] = useState('birth');

  return (
    <div style={{ width: 200 }}>
      <Select.Root
        value={value}
        onValueChange={(next) => next && setValue(next)}
        disabled={disabled}
      >
        <Select.Trigger aria-label="Event type">
          <Select.Value />
          <Select.Icon>
            <Icon name="chevron-down" size={14} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4}>
            <Select.Popup>
              {EVENT_TYPES.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export const Default: Story = { render: () => <EventTypeSelect /> };

export const Disabled: Story = { render: () => <EventTypeSelect disabled /> };

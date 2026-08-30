import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './switch';

const meta = {
  title: 'UI/Switch',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled Base UI Switch — `Root` + `Thumb`. Base UI supplies the `switch` role, ' +
          'keyboard activation and focus handling.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

function Toggle({ disabled, initial = false }: { disabled?: boolean; initial?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return (
    <Switch.Root
      aria-label="Deceased"
      checked={checked}
      onCheckedChange={setChecked}
      disabled={disabled}
    >
      <Switch.Thumb />
    </Switch.Root>
  );
}

export const Off: Story = { render: () => <Toggle /> };

export const On: Story = { render: () => <Toggle initial /> };

export const Disabled: Story = { render: () => <Toggle disabled /> };

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { OptionCard, OptionCardGroup } from './option-card';

type GroupArgs = React.ComponentProps<typeof OptionCardGroup>;

const meta: Meta<GroupArgs> = {
  title: 'UI/OptionCard',
  component: OptionCardGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    cols: { control: 'select', options: [1, 2, 3] },
  },
  args: {
    'aria-label': 'Starting point',
    value: 'empty',
    onValueChange: fn(),
    children: null,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<GroupArgs>;

export const TwoColumns: Story = {
  args: { cols: 2 },
  render: (args) => (
    <OptionCardGroup {...args}>
      <OptionCard
        value="empty"
        label="Empty tree"
        description="Start from a blank canvas — no individuals, no families."
      />
      <OptionCard
        value="from-me"
        label="Tree from me"
        description="Pre-fill with you as the starting individual."
      />
    </OptionCardGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Starting point' });
    await expect(group).toBeInTheDocument();
    await expect(canvas.getAllByRole('radio')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('radio', { name: /Tree from me/ }));
    await expect(args.onValueChange).toHaveBeenCalledWith('from-me');
  },
};

export const ThreeColumns: Story = {
  args: { cols: 3, value: 'gedcom', 'aria-label': 'Export format' },
  render: (args) => (
    <OptionCardGroup {...args}>
      <OptionCard value="gedcom" label="GEDCOM" description="Standard genealogical exchange." />
      <OptionCard
        value="json"
        label="JSON"
        description="Structured archive with all internal fields."
        soon
        soonLabel="Soon"
      />
      <OptionCard
        value="zip"
        label="ZIP archive"
        description="GEDCOM + media files bundled together."
        soon
        soonLabel="Soon"
      />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
    // The two `soon` options must be disabled.
    const json = canvas.getByRole('radio', { name: /JSON/ });
    const zip = canvas.getByRole('radio', { name: /ZIP archive/ });
    await expect(json).toBeDisabled();
    await expect(zip).toBeDisabled();
  },
};

export const Disabled: Story = {
  render: (args) => (
    <OptionCardGroup {...args}>
      <OptionCard value="empty" label="Empty" />
      <OptionCard value="from-me" label="From me" disabled />
    </OptionCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fromMe = canvas.getByRole('radio', { name: 'From me' });
    await expect(fromMe).toBeDisabled();
  },
};

function ControlledGroup() {
  const [value, setValue] = useState('empty');
  return (
    <OptionCardGroup value={value} onValueChange={setValue} aria-label="Starting point">
      <OptionCard value="empty" label="Empty" />
      <OptionCard value="from-me" label="From me" />
    </OptionCardGroup>
  );
}

export const Controlled: Story = {
  render: () => <ControlledGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fromMe = canvas.getByRole('radio', { name: 'From me' });
    await userEvent.click(fromMe);
    await expect(fromMe).toHaveAttribute('aria-checked', 'true');
  },
};

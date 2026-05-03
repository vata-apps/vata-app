import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SegmentedControl } from './segmented-control';

type Args = React.ComponentProps<typeof SegmentedControl>;

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

const meta: Meta<Args> = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    'aria-label': 'Sort by',
    value: 'recent',
    options: sortOptions,
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Sort by' });
    await expect(group).toBeInTheDocument();
    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
    const recent = canvas.getByRole('radio', { name: 'Recent' });
    await expect(recent).toHaveAttribute('aria-checked', 'true');
  },
};

export const TwoOptions: Story = {
  args: {
    'aria-label': 'Theme',
    value: 'dark',
    options: [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const light = canvas.getByRole('radio', { name: 'Light' });
    await userEvent.click(light);
    await expect(args.onValueChange).toHaveBeenCalledWith('light');
  },
};

export const Small: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'recent', label: 'Recent' },
      { value: 'name', label: 'Name' },
      { value: 'size', label: 'Size', disabled: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sizeOption = canvas.getByRole('radio', { name: 'Size' });
    await expect(sizeOption).toBeDisabled();
  },
};

function ControlledControl() {
  const [value, setValue] = useState('recent');
  return (
    <SegmentedControl
      value={value}
      onValueChange={(next) => {
        if (next) setValue(next);
      }}
      options={sortOptions}
      aria-label="Sort"
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledControl />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('radio', { name: 'Name' });
    await userEvent.click(name);
    await expect(name).toHaveAttribute('aria-checked', 'true');
  },
};

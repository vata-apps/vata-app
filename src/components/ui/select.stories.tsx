import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Select } from './select';

type SelectArgs = ComponentProps<typeof Select>;

const formatOptions = [
  { value: 'gedcom-5.5.1', label: 'GEDCOM 5.5.1' },
  { value: 'gedcom-7.0', label: 'GEDCOM 7.0' },
  { value: 'json', label: 'JSON' },
];

const meta: Meta<SelectArgs> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    value: undefined,
    onValueChange: fn(),
    options: formatOptions,
    placeholder: 'Pick a format',
    'aria-label': 'Export format',
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    await expect(trigger).toBeInTheDocument();
  },
};

export const OpenAndSelect: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    await userEvent.click(trigger);
    const body = canvasElement.ownerDocument.body;
    const json = within(body).getByRole('option', { name: 'JSON' });
    await userEvent.click(json);
    await expect(args.onValueChange).toHaveBeenCalledWith('json');
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'gedcom-5.5.1', label: 'GEDCOM 5.5.1' },
      { value: 'gedcom-7.0', label: 'GEDCOM 7.0', disabled: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    await userEvent.click(trigger);
    const body = canvasElement.ownerDocument.body;
    const disabledOption = within(body).getByRole('option', { name: 'GEDCOM 7.0' });
    await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WithHint: Story = {
  parameters: { layout: 'padded' },
  args: { hint: 'GEDCOM 5.5.1 is the safest target for compatibility.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    const describedBy = trigger.getAttribute('aria-describedby');
    await expect(describedBy).not.toBeNull();
    const hint = canvas.getByText(/GEDCOM 5.5.1 is the safest/);
    await expect(hint.id).toBe(describedBy);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Export format' });
    await expect(trigger).toBeDisabled();
  },
};

const sizes = ['sm', 'md', 'lg'] as const;

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <Select key={size} {...args} size={size} aria-label={`Size ${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('combobox')).toHaveLength(sizes.length);
  },
};

function ControlledSelect() {
  const [value, setValue] = useState('json');
  return (
    <Select
      value={value}
      onValueChange={setValue}
      options={formatOptions}
      placeholder="Pick…"
      aria-label="Format"
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Format' });
    await userEvent.click(trigger);
    const body = canvasElement.ownerDocument.body;
    const option = within(body).getByRole('option', { name: 'GEDCOM 5.5.1' });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('GEDCOM 5.5.1');
  },
};

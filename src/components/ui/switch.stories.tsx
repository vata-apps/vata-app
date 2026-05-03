import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Switch } from './switch';

type SwitchArgs = React.ComponentProps<typeof Switch>;

const meta: Meta<SwitchArgs> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Preserve original dates',
    checked: false,
    onCheckedChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch', { name: 'Preserve original dates' });
    await expect(switchEl).toBeInTheDocument();
    await expect(switchEl).toHaveAttribute('aria-checked', 'false');
  },
};

export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await expect(switchEl).toHaveAttribute('aria-checked', 'true');
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Detect duplicates',
    description: 'Match individuals by name and birth date during import.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch', { name: /Detect duplicates/ });
    const describedBy = switchEl.getAttribute('aria-describedby');
    await expect(describedBy).not.toBeNull();
    const description = canvas.getByText(/Match individuals by name/);
    await expect(description.id).toBe(describedBy);
  },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Disabled toggle' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await expect(switchEl).toBeDisabled();
  },
};

export const ClicksToggle: Story = {
  args: { label: 'Click to toggle', checked: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await userEvent.click(switchEl);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const LabelClickToggles: Story = {
  args: { label: 'Click anywhere on the row', checked: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const labelText = canvas.getByText('Click anywhere on the row');
    await userEvent.click(labelText);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

const sizes = ['sm', 'md', 'lg'] as const;

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-2">
      {sizes.map((size) => (
        <Switch key={size} {...args} size={size} label={`Size: ${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('switch')).toHaveLength(sizes.length);
  },
};

function ControlledSwitch() {
  const [on, setOn] = useState(false);
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label="Controlled"
      description={`Currently: ${on ? 'on' : 'off'}`}
    />
  );
}

export const Controlled: Story = {
  render: () => <ControlledSwitch />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch', { name: 'Controlled' });
    await userEvent.click(switchEl);
    await expect(switchEl).toHaveAttribute('aria-checked', 'true');
  },
};

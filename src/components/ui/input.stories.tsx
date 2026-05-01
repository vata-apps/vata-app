import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Type something…',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'url', 'tel', 'search', 'password'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText('Type something…')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Cannot edit', onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByDisplayValue<HTMLInputElement>('Cannot edit');
    await userEvent.type(input, 'extra');
    await expect(input.value).toBe('Cannot edit');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'not-an-email', type: 'email' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByDisplayValue('not-an-email');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('type', 'email');
  },
};

export const WithLabel: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="input-with-label" className="text-foreground text-sm font-medium">
        Full name
      </label>
      <Input {...args} id="input-with-label" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Full name')).toBeInTheDocument();
  },
};

function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="controlled-input" className="text-foreground text-sm font-medium">
        Name
      </label>
      <Input id="controlled-input" value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}

export const Controlled: Story = {
  parameters: { layout: 'padded' },
  render: () => <ControlledInput />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText<HTMLInputElement>('Name');
    await userEvent.type(input, 'Maria');
    await expect(input.value).toBe('Maria');
  },
};

const sizes = ['sm', 'md', 'lg'] as const;

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <Input key={size} {...args} size={size} placeholder={`Size: ${size}`} />
      ))}
    </div>
  ),
};

const types = ['text', 'email', 'url', 'tel', 'search', 'password'] as const;

export const Types: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-3">
      {types.map((type) => (
        <div key={type} className="flex flex-col gap-1">
          <label className="text-muted-foreground text-xs uppercase" htmlFor={`input-type-${type}`}>
            {type}
          </label>
          <Input id={`input-type-${type}`} type={type} placeholder={type} />
        </div>
      ))}
    </div>
  ),
};

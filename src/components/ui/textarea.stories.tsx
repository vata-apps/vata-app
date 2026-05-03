import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Textarea } from './textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { placeholder: 'Add a description…' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText('Add a description…')).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Cannot edit', onChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByDisplayValue<HTMLTextAreaElement>('Cannot edit');
    await expect(textarea).toBeDisabled();
  },
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'too short' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByDisplayValue('too short');
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WithHint: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="textarea-with-hint" className="text-foreground text-sm font-medium">
        Bio
      </label>
      <Textarea
        {...args}
        id="textarea-with-hint"
        hint="Plain text only — no formatting is preserved."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText<HTMLTextAreaElement>('Bio');
    const describedBy = textarea.getAttribute('aria-describedby');
    await expect(describedBy).not.toBeNull();
    const hint = canvas.getByText(/Plain text only/i);
    await expect(hint.id).toBe(describedBy);
  },
};

const sizes = ['sm', 'md', 'lg'] as const;

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <Textarea key={size} {...args} size={size} placeholder={`Size: ${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('textbox')).toHaveLength(sizes.length);
  },
};

function ControlledTextarea() {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="controlled-textarea" className="text-foreground text-sm font-medium">
        Notes
      </label>
      <Textarea id="controlled-textarea" value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}

export const Controlled: Story = {
  parameters: { layout: 'padded' },
  render: () => <ControlledTextarea />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText<HTMLTextAreaElement>('Notes');
    await userEvent.type(textarea, 'Hello');
    await expect(textarea.value).toBe('Hello');
  },
};

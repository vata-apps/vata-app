import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { Dropzone } from './dropzone';

const meta = {
  title: 'UI/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'selected', 'scanning', 'done', 'error'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    idleLabel: 'Drop a .ged file or click to browse',
    onFileSelected: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Drop a .ged file or click to browse')).toBeInTheDocument();
  },
};

export const Selected: Story = {
  args: { state: 'selected', selectedName: 'family-tree.ged' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('family-tree.ged')).toBeInTheDocument();
  },
};

export const Scanning: Story = {
  args: { state: 'scanning', selectedName: 'family-tree.ged' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    // Scanning should be non-interactive (cursor-progress, aria-disabled).
    await expect(button).toBeDisabled();
  },
};

export const Done: Story = {
  args: { state: 'done', selectedName: 'family-tree.ged' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  },
};

export const ErrorState: Story = {
  name: 'Error',
  args: { state: 'error', selectedName: 'family-tree.ged' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  },
};

export const WithHint: Story = {
  parameters: { layout: 'padded' },
  args: { hint: 'Max 50 MB. The original file is never modified.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Max 50 MB/)).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
  },
};

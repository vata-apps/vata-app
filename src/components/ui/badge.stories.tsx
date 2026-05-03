import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info', 'outline', 'soon'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    dot: { control: 'boolean' },
  },
  args: { children: 'Ready' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ready')).toBeInTheDocument();
  },
};

export const WithDot: Story = {
  args: { variant: 'success', dot: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Ready');
    // Dot is the first child span and must be aria-hidden.
    const dot = badge.querySelector('span[aria-hidden]');
    await expect(dot).not.toBeNull();
  },
};

export const Soon: Story = {
  args: { variant: 'soon', children: 'Soon' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Soon')).toBeInTheDocument();
  },
};

const variants = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'outline',
  'soon',
] as const;
const sizes = ['sm', 'md'] as const;

export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-3">
      {sizes.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          {variants.map((variant) => (
            <Badge key={`${size}-${variant}`} size={size} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each variant appears once per size row.
    for (const variant of variants) {
      const matches = canvas.getAllByText(variant);
      await expect(matches.length).toBe(sizes.length);
    }
  },
};

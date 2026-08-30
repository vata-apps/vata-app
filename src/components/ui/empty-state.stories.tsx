import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from './card';
import { EmptyState } from './empty-state';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'No sources recorded yet' },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Serif italic reads as a note in the margin, not an error — its whole point. */
export const InACard: Story = {
  render: () => (
    <Card style={{ width: 360, textAlign: 'center', padding: 32 }}>
      <EmptyState>Nothing recorded for this life yet</EmptyState>
    </Card>
  ),
};

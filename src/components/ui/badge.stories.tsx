import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: 'Primary' },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Read-only pills for category tags and role labels. */
export const Cluster: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge>Birth</Badge>
      <Badge>Baptism</Badge>
      <Badge>Primary name</Badge>
      <Badge>Deceased</Badge>
    </div>
  ),
};

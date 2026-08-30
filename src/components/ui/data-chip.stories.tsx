import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataChip } from './data-chip';
import { Typography } from './typography';

const meta = {
  title: 'UI/DataChip',
  component: DataChip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { children: '1847' },
} satisfies Meta<typeof DataChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Year: Story = {};

export const FullDate: Story = { args: { children: '12 Mar 1847' } };

/** Where it belongs — a small outlined date beside an event title. */
export const BesideEvent: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Typography size="sm" weight="medium">
        Birth
      </Typography>
      <DataChip>1847</DataChip>
    </div>
  ),
};

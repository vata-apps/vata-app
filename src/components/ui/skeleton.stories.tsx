import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default height is one line of text, so it drops into table cells and fields. */
export const Line: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Skeleton />
    </div>
  ),
};

export const Block: Story = {
  render: () => <Skeleton style={{ width: 240, height: 96, display: 'block' }} />,
};

/** A few stacked lines standing in for a list while it loads. */
export const ListPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10, width: 240 }}>
      <Skeleton style={{ width: '80%' }} />
      <Skeleton style={{ width: '65%' }} />
      <Skeleton style={{ width: '72%' }} />
    </div>
  ),
};

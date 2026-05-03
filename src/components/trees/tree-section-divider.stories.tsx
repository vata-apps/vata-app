import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TreeSectionDivider, type TreeSectionDividerProps } from './tree-section-divider';

const sortOptions = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

function Wrapper(args: Omit<TreeSectionDividerProps, 'sortValue' | 'onSortChange'>): JSX.Element {
  const [sort, setSort] = useState('recent');
  return <TreeSectionDivider {...args} sortValue={sort} onSortChange={setSort} />;
}

const meta = {
  title: 'Trees/TreeSectionDivider',
  component: Wrapper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Your trees',
    count: 4,
    sortOptions,
    sortAriaLabel: 'Sort trees',
  },
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Your trees')).toBeInTheDocument();
    await expect(canvas.getByText('4')).toBeInTheDocument();
    const recent = canvas.getByRole('radio', { name: 'Recent' });
    await expect(recent).toHaveAttribute('data-state', 'on');
  },
};

export const SwitchSort: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('radio', { name: 'Name' });
    await userEvent.click(name);
    await expect(name).toHaveAttribute('data-state', 'on');
  },
};

export const EmptyCount: Story = {
  args: { count: 0 },
};

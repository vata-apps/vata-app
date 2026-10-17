import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SortBy, SortOption } from './SortBy';

type Column = 'surname' | 'firstName';

const OPTIONS = [
  { label: 'Surname (A-Z)', column: 'surname', direction: 'asc' },
  { label: 'Surname (Z-A)', column: 'surname', direction: 'desc' },
  { label: 'First name (A-Z)', column: 'firstName', direction: 'asc' },
  { label: 'First name (Z-A)', column: 'firstName', direction: 'desc' },
] satisfies SortOption<Column>[];

const meta = {
  title: 'UI/SortBy',
  component: SortBy,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },

  args: {
    ...OPTIONS[1],
    options: OPTIONS,
    onChange: console.log,
  },

  argTypes: {
    column: { control: false },
    direction: { control: false },
  },

  render: ({ column, direction, ...args }) => {
    const [values, setValues] = useState({ column, direction });
    return <SortBy {...args} {...values} onChange={setValues} />;
  },
} satisfies Meta<typeof SortBy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SortBy } from './SortBy';

const OPTIONS = [
  { label: 'Surname', value: 'surname' },
  { label: 'First name', value: 'firstName' },
  { label: 'Birth date', value: 'birthDate' },
  { label: 'Death date', value: 'deathDate' },
];

const meta = {
  title: 'UI/SortBy',
  component: SortBy,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    options: OPTIONS,
    onChange: console.log,
    value: 'surname',
  },
  argTypes: {},
  render: (args) => {
    const [value, setValue] = useState<string | null>(args.value);
    return <SortBy {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof SortBy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

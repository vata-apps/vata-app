import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SearchInput } from './search-input';

const meta = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function Controlled({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ width: 260 }}>
      <SearchInput
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue('')}
        placeholder="Filter people…"
        clearLabel="Clear search"
      />
    </div>
  );
}

export const Empty: Story = { render: () => <Controlled /> };

/** Once there is text and `onClear` is set, the clear affordance appears. */
export const WithValue: Story = { render: () => <Controlled initial="Gagnon" /> };

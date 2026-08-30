import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '$components/icon';
import { EntityPicker, type EntityPickerItem } from './entity-picker';

// All-required props → bare `Meta`, wrapper-driven stories (see docs/ui/storybook.md).
const meta = {
  title: 'UI/EntityPicker',
  component: EntityPicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Search-and-attach popover for an existing record, with an optional "Create …" ' +
          'footer. Data (which `items` to show, debouncing, server search) is the caller’s — ' +
          'the primitive owns the popover chrome, the search field and the result rows.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj;

// `meta` mirrors what the person pickers pass in production — `formatLifeYears`
// from $lib/personSummary, i.e. the "b. 1847 – 1921" shape.
const PEOPLE: EntityPickerItem[] = [
  { id: '1', title: 'Marie-Louise Gagnon', meta: 'b. 1847 – 1921', initials: 'MG' },
  { id: '2', title: 'Joseph Bélanger', meta: 'b. 1843 – 1902', initials: 'JB' },
  { id: '3', title: 'Adèle Gagnon', meta: 'b. 1871 – 1949', initials: 'AG' },
  { id: '4', title: 'Napoléon Bélanger', meta: 'b. 1869', initials: 'NB' },
];

function Picker({
  withCreate,
  initialQuery = '',
}: {
  withCreate?: boolean;
  initialQuery?: string;
}) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [picked, setPicked] = useState<EntityPickerItem | null>(null);

  const items = PEOPLE.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ minHeight: 360 }}>
      <EntityPicker
        open={open}
        onOpenChange={setOpen}
        trigger={
          <>
            <Icon name="plus" size={14} />
            {picked ? picked.title : 'Add spouse'}
          </>
        }
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search people…"
        clearLabel="Clear"
        items={items}
        onSelect={(item) => {
          setPicked(item);
          setOpen(false);
        }}
        hint={items.length === 0 ? 'No matching people' : undefined}
        onCreate={withCreate ? () => setOpen(false) : undefined}
        createLabel={withCreate ? 'Create a new person' : undefined}
        createIcon={withCreate ? <Icon name="plus" size={14} /> : undefined}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Picker /> };

export const WithCreateFooter: Story = { render: () => <Picker withCreate /> };

export const NoMatches: Story = { render: () => <Picker initialQuery="zzz" /> };

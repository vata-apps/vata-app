import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table, type TableColumn } from './table';

// Generic + all-required props → bare `Meta`, wrapper-driven stories (see docs/ui/storybook.md).
const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic, sortable, activatable table. Owns table mechanics only — sticky header, ' +
          'sort indicators, whole-row activation that follows the row’s primary link. Loading / ' +
          'empty / error messaging lives in the application `EntityTable`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

interface Person {
  id: string;
  name: string;
  born: number | null;
  died: number | null;
  place: string;
}

const PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Marie-Louise Gagnon',
    born: 1847,
    died: 1921,
    place: 'Saint-Roch-des-Aulnaies',
  },
  { id: '2', name: 'Joseph Bélanger', born: 1843, died: 1902, place: 'Kamouraska' },
  { id: '3', name: 'Adèle Gagnon', born: 1871, died: 1949, place: 'Québec' },
  { id: '4', name: 'Napoléon Bélanger', born: 1869, died: null, place: 'Rimouski' },
];

const columns: TableColumn<Person>[] = [
  {
    key: 'name',
    header: 'Name',
    rowHeader: true,
    cell: (p) => <a href={`#/person/${p.id}`}>{p.name}</a>,
    sortValue: (p) => p.name,
  },
  { key: 'born', header: 'Born', cell: (p) => p.born ?? '—', sortValue: (p) => p.born },
  { key: 'died', header: 'Died', cell: (p) => p.died ?? '—', sortValue: (p) => p.died },
  { key: 'place', header: 'Birth place', cell: (p) => p.place },
];

type Story = StoryObj;

export const Basic: Story = {
  render: () => <Table label="People" columns={columns} rows={PEOPLE} getRowKey={(p) => p.id} />,
};

/** Click a header with a `sortValue` to sort; the primitive manages sort state. */
export const Sortable: Story = {
  render: () => (
    <Table
      label="People"
      columns={columns}
      rows={PEOPLE}
      getRowKey={(p) => p.id}
      defaultSort={{ columnKey: 'born', direction: 'asc' }}
    />
  ),
};

/** `bodyContent` replaces the mapped rows — how `EntityTable` renders its empty state. */
export const EmptyBody: Story = {
  render: () => (
    <Table
      label="People"
      columns={columns}
      rows={[]}
      getRowKey={(p) => p.id}
      bodyContent={
        <tr>
          <td colSpan={columns.length} style={{ padding: 24, textAlign: 'center' }}>
            No people match the current filters
          </td>
        </tr>
      }
    />
  ),
};

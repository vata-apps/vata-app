import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TreeCard, type TreeCardCtaProps, type TreeCardDefaultProps } from './tree-card';

const labels = {
  open: 'Open',
  export: 'Export',
  edit: 'Rename',
  delete: 'Delete',
  individuals: 'Individuals',
  families: 'Families',
  generations: 'Generations',
};

// We type Meta against the *default* variant — the CTA story casts at
// the call site below. Using a plain union here would make Storybook's
// args helper resolve to `never` for non-shared properties.
const meta = {
  title: 'Trees/TreeCard',
  component: TreeCard as unknown as (props: TreeCardDefaultProps) => JSX.Element,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TreeCardDefaultProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs: TreeCardDefaultProps = {
  variant: 'default',
  name: 'Bourgoin family',
  description: "Started from grandpa's notebook in 2024.",
  stats: { individuals: 142, families: 58 },
  meta: { createdAt: 'Created Jan 12, 2024', lastAccessedAt: 'Last opened 2h ago' },
  labels,
  onOpen: fn(),
  onExport: fn(),
  onEdit: fn(),
  onDelete: fn(),
};

export const Default: Story = {
  args: defaultArgs,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Bourgoin family')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

export const WithGenerations: Story = {
  args: {
    ...defaultArgs,
    stats: { individuals: 142, families: 58, generations: 6 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('6')).toBeInTheDocument();
    await expect(canvas.getByText('Generations')).toBeInTheDocument();
  },
};

export const NoDescription: Story = {
  args: { ...defaultArgs, description: undefined },
};

export const LongName: Story = {
  args: {
    ...defaultArgs,
    name: 'A very long family tree name that should still wrap gracefully',
  },
};

export const ActionsFire: Story = {
  args: defaultArgs,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Rename' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    await expect(args.onExport).toHaveBeenCalledTimes(1);
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};

// CTA variant: the type cast is intentional — see the comment on `meta`.
const ctaArgs = {
  variant: 'cta',
  label: 'Add a new tree',
  onClick: fn(),
} as unknown as TreeCardDefaultProps;

export const Cta: Story = {
  name: 'CTA',
  args: ctaArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Add a new tree/ });
    const onClick = (ctaArgs as unknown as TreeCardCtaProps).onClick;
    await userEvent.click(button);
    await expect(onClick).toHaveBeenCalledTimes(1);
  },
};

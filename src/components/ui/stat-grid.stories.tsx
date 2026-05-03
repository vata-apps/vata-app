import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { StatGrid } from './stat-grid';

const meta = {
  title: 'UI/StatGrid',
  component: StatGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    cols: { control: 'select', options: [2, 3, 4] },
  },
  args: {
    items: [
      { value: 142, label: 'Individuals' },
      { value: 58, label: 'Families' },
      { value: 412, label: 'Events' },
      { value: 23, label: 'Sources' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourColumns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Individuals')).toBeInTheDocument();
    await expect(canvas.getByText('142')).toBeInTheDocument();
    await expect(canvas.getByText('58')).toBeInTheDocument();
  },
};

export const ThreeColumns: Story = {
  args: {
    cols: 3,
    items: [
      { value: 142, label: 'Individuals' },
      { value: '2024-01-12', label: 'Created' },
      { value: '2 hours ago', label: 'Last accessed' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2 hours ago')).toBeInTheDocument();
  },
};

export const WithDestructiveAccent: Story = {
  args: {
    cols: 3,
    items: [
      { value: 142, label: 'Individuals', accent: 'destructive' },
      { value: 58, label: 'Families', accent: 'destructive' },
      { value: 412, label: 'Events', accent: 'destructive' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three cells render their numeric value
    await expect(canvas.getByText('142')).toBeInTheDocument();
    await expect(canvas.getByText('58')).toBeInTheDocument();
    await expect(canvas.getByText('412')).toBeInTheDocument();
  },
};

export const MixedAccents: Story = {
  args: {
    cols: 4,
    items: [
      { value: 142, label: 'Individuals' },
      { value: 58, label: 'Families' },
      { value: 12, label: 'Pending', accent: 'warning' },
      { value: 5, label: 'Errors', accent: 'destructive' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Pending')).toBeInTheDocument();
    await expect(canvas.getByText('Errors')).toBeInTheDocument();
  },
};

export const TwoColumns: Story = {
  args: {
    cols: 2,
    items: [
      { value: 142, label: 'Individuals' },
      { value: 58, label: 'Families' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('142')).toBeInTheDocument();
    await expect(canvas.getByText('58')).toBeInTheDocument();
  },
};

export const SuccessAccent: Story = {
  args: {
    cols: 3,
    items: [
      { value: 142, label: 'Imported', accent: 'success' },
      { value: 0, label: 'Errors', accent: 'success' },
      { value: 12, label: 'Skipped', accent: 'success' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Imported')).toBeInTheDocument();
  },
};

export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {([2, 3, 4] as const).map((cols) => (
        <StatGrid
          key={cols}
          cols={cols}
          items={(
            [
              { value: 10, label: `cols ${cols} – default` },
              { value: 20, label: 'destructive', accent: 'destructive' },
              { value: 30, label: 'success', accent: 'success' },
              { value: 40, label: 'warning', accent: 'warning' },
            ] as const
          ).slice(0, cols)}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 2 + 3 + 4 = 9 cells across the three grids.
    await expect(
      canvas.getAllByText(/^(default|destructive|success|warning|cols \d+ – default)$/i).length
    ).toBeGreaterThanOrEqual(3);
  },
};

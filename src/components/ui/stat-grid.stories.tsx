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

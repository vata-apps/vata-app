import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Icon, iconRegistry, type IconName } from './icon';

const iconNames = Object.keys(iconRegistry) as IconName[];

const meta = {
  title: 'UI/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'plus',
  },
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
    },
    size: { control: { type: 'number', min: 8, max: 64, step: 1 } },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).not.toBeNull();
    // Icons are decorative by default — assistive tech should skip them.
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
  },
};

export const CustomSize: Story = {
  args: { size: 32 },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toHaveAttribute('width', '32');
    await expect(svg).toHaveAttribute('height', '32');
  },
};

export const StandaloneAccessible: Story = {
  args: {
    name: 'search',
    'aria-hidden': false,
    'aria-label': 'Search',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // When the icon stands alone, it carries its own accessible name.
    await expect(canvas.getByLabelText('Search')).toBeInTheDocument();
  },
};

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
      {iconNames.map((name) => (
        <div
          key={name}
          className="border-border bg-card flex flex-col items-center gap-2 rounded-md border p-3"
        >
          <Icon name={name} size={24} />
          <code className="text-muted-foreground text-xs">{name}</code>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg');
    await expect(svgs.length).toBe(iconNames.length);
  },
};

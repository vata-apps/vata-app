import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TreeCardCta } from './tree-card-cta';

const meta = {
  title: 'Trees/TreeCardCta',
  component: TreeCardCta,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Start a new tree',
    onClick: fn(),
  },
} satisfies Meta<typeof TreeCardCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Start a new tree/ });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Start a new tree',
    subtitle: 'Or drop a .ged file',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Start a new tree')).toBeInTheDocument();
    await expect(canvas.getByText('Or drop a .ged file')).toBeInTheDocument();
  },
};

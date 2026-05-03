import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="p-3 text-sm">
        <p>Inside the popover</p>
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await userEvent.click(trigger);
    await waitFor(async () => {
      const body = within(document.body);
      await expect(body.getByText('Inside the popover')).toBeInTheDocument();
    });
  },
};

export const ClosesOnEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await userEvent.click(trigger);
    const body = within(document.body);
    await waitFor(async () => {
      await expect(body.getByText('Inside the popover')).toBeInTheDocument();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(body.queryByText('Inside the popover')).not.toBeInTheDocument();
    });
  },
};

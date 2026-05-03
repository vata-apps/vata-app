import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppStatusBar } from './app-status-bar';
import { Button } from './ui/button';

const meta = {
  title: 'App/AppStatusBar',
  component: AppStatusBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    brandLabel: 'Vata',
    version: '0.1.0',
    debugLabel: 'Debug',
    onDebugClick: fn(),
    preferencesTrigger: (
      <Button variant="outline" size="sm" leadingIcon="settings" className="font-mono">
        Preferences
      </Button>
    ),
  },
} satisfies Meta<typeof AppStatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Vata')).toBeInTheDocument();
    await expect(canvas.getByText('v 0.1.0')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Debug/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Preferences/ })).toBeInTheDocument();
  },
};

export const WithShortcut: Story = {
  args: {
    debugShortcut: '⌘D',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('⌘D')).toBeInTheDocument();
  },
};

export const DebugFires: Story = {
  args: {
    debugShortcut: '⌘D',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Debug/ }));
    await expect(args.onDebugClick).toHaveBeenCalledTimes(1);
  },
};

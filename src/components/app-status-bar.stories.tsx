import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppStatusBar } from './app-status-bar';
import { Button } from './ui/button';

const onDebugClick = fn();

const meta = {
  title: 'App/AppStatusBar',
  component: AppStatusBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    brandLabel: 'Vata',
    version: '0.1.0',
    debug: { label: 'Debug', onClick: onDebugClick },
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
    debug: { label: 'Debug', shortcut: '⌘D', onClick: onDebugClick },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('⌘D')).toBeInTheDocument();
  },
};

export const DebugFires: Story = {
  args: {
    debug: { label: 'Debug', shortcut: '⌘D', onClick: onDebugClick },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onDebugClick.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: /Debug/ }));
    await expect(onDebugClick).toHaveBeenCalledTimes(1);
  },
};

export const NoDebug: Story = {
  args: {
    debug: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Debug/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Preferences/ })).toBeInTheDocument();
  },
};

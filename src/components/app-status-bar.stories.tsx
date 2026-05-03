import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppStatusBar } from './app-status-bar';

const meta = {
  title: 'App/AppStatusBar',
  component: AppStatusBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    brandLabel: 'Vata',
    version: '0.1.0',
    debugLabel: 'Debug',
    preferencesLabel: 'Preferences',
    onDebugClick: fn(),
    onPreferencesClick: fn(),
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

export const ButtonsFire: Story = {
  args: {
    debugShortcut: '⌘D',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Debug/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Preferences/ }));
    await expect(args.onDebugClick).toHaveBeenCalledTimes(1);
    await expect(args.onPreferencesClick).toHaveBeenCalledTimes(1);
  },
};

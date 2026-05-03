import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { useAppStore } from '$/store/app-store';
import { PreferencesPopover } from './preferences-popover';
import { Button } from './ui/button';

const meta = {
  title: 'App/PreferencesPopover',
  component: PreferencesPopover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    children: null,
  },
  render: () => (
    <PreferencesPopover>
      <Button variant="outline" size="sm" leadingIcon="settings">
        Preferences
      </Button>
    </PreferencesPopover>
  ),
} satisfies Meta<typeof PreferencesPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    useAppStore.setState({ theme: 'system' });
    document.documentElement.classList.remove('light', 'dark');

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Preferences/ }));

    const body = within(document.body);
    await waitFor(async () => {
      await expect(body.getByText('Theme')).toBeInTheDocument();
      await expect(body.getByText('Language')).toBeInTheDocument();
    });
  },
};

export const SwitchTheme: Story = {
  play: async ({ canvasElement }) => {
    useAppStore.setState({ theme: 'system' });
    document.documentElement.classList.remove('light', 'dark');

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Preferences/ }));

    const body = within(document.body);
    await waitFor(async () => {
      await expect(body.getByText('Dark')).toBeInTheDocument();
    });

    await userEvent.click(body.getByRole('radio', { name: 'Dark' }));
    await expect(useAppStore.getState().theme).toBe('dark');
  },
};

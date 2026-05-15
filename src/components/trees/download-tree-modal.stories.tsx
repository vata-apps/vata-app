import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '$components/ui/button';
import { DownloadTreeModal } from './download-tree-modal';

type ModalArgs = ComponentProps<typeof DownloadTreeModal>;

/** Build a fresh QueryClient that doesn't retry — keeps stories deterministic. */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Provides a per-story QueryClient so `useMutation` works inside the modal. */
function QueryWrapper({ children }: { children: ReactNode }): JSX.Element {
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * Renders an "Open" button alongside the modal so each play() can
 * exercise the open transition like a real user would.
 */
function ModalHarness({ open: argOpen, onOpenChange, ...props }: ModalArgs): JSX.Element {
  const [open, setOpen] = useState(Boolean(argOpen));
  useEffect(() => {
    setOpen(Boolean(argOpen));
  }, [argOpen]);

  return (
    <QueryWrapper>
      <Button onClick={() => setOpen(true)}>Open download-tree modal</Button>
      <DownloadTreeModal
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      />
    </QueryWrapper>
  );
}

const sampleTree = {
  id: 'tree-1',
  name: 'Bourgoin family',
  individualCount: 142,
  familyCount: 58,
};

const meta: Meta<ModalArgs> = {
  title: 'Trees/DownloadTreeModal',
  component: DownloadTreeModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    a11y: {
      // Radix focus-trap sentinels confuse axe's aria-hidden-focus rule
      // — same exemption as the Dialog stories.
      config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
    },
  },
  args: {
    tree: sampleTree,
    open: false,
    onOpenChange: fn(),
  },
  render: (args) => <ModalHarness {...args} />,
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open download-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Download tree');
    await expect(body.getByText('Bourgoin family')).toBeInTheDocument();

    // Three format cards — GEDCOM enabled, the others Soon-disabled.
    const radios = await body.findAllByRole('radio');
    await expect(radios).toHaveLength(3);
    await expect(body.getByRole('radio', { name: /GEDCOM/ })).toBeEnabled();
    await expect(body.getByRole('radio', { name: /Vata JSON/ })).toBeDisabled();
    await expect(body.getByRole('radio', { name: /Archive/ })).toBeDisabled();

    // Stat grid renders the tree counts.
    await expect(body.getByText('142')).toBeInTheDocument();
    await expect(body.getByText('58')).toBeInTheDocument();
  },
};

export const SubmitCallsExportDefaultsToIncludePrivate: Story = {
  args: {
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open download-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    await userEvent.click(body.getByRole('button', { name: /Download \.ged/ }));

    // Hide-living defaults to off → includePrivate is true.
    await waitFor(() => {
      expect(args.exportTree).toHaveBeenCalledWith('Bourgoin family', true);
    });
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const HideLivingFlipsIncludePrivate: Story = {
  args: {
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open download-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    const hideLiving = body.getByRole('switch', { name: /Hide living/ });
    await userEvent.click(hideLiving);

    await userEvent.click(body.getByRole('button', { name: /Download \.ged/ }));

    await waitFor(() => {
      expect(args.exportTree).toHaveBeenCalledWith('Bourgoin family', false);
    });
  },
};

export const CancelledSaveDialogKeepsModalOpen: Story = {
  args: {
    // exportToFile returns false when the user cancels the save dialog.
    exportTree: fn(async () => false),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open download-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    await userEvent.click(body.getByRole('button', { name: /Download \.ged/ }));

    await waitFor(() => expect(args.exportTree).toHaveBeenCalled());
    // No close on cancel.
    await expect(args.onOpenChange).not.toHaveBeenCalledWith(false);
  },
};

export const CancelClosesWithoutExport: Story = {
  args: {
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open download-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const cancel = await body.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancel);

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
    expect(args.exportTree).not.toHaveBeenCalled();
  },
};

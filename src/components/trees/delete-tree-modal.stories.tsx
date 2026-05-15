import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '$components/ui/button';
import { DeleteTreeModal } from './delete-tree-modal';

type ModalArgs = ComponentProps<typeof DeleteTreeModal>;

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
      <Button onClick={() => setOpen(true)}>Open delete-tree modal</Button>
      <DeleteTreeModal
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
  title: 'Trees/DeleteTreeModal',
  component: DeleteTreeModal,
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
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Delete Bourgoin family?');

    // Stat grid renders the tree counts.
    await expect(body.getByText('142')).toBeInTheDocument();
    await expect(body.getByText('58')).toBeInTheDocument();

    // Submit disabled until type-to-confirm matches.
    const submit = body.getByRole('button', { name: 'Delete tree' });
    await expect(submit).toBeDisabled();
  },
};

export const SubmitEnabledOnExactMatch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    const confirm = await body.findByLabelText('Type the tree name to confirm');
    await userEvent.type(confirm, 'Wrong name');
    const submit = body.getByRole('button', { name: 'Delete tree' });
    await expect(submit).toBeDisabled();

    await userEvent.clear(confirm);
    await userEvent.type(confirm, 'Bourgoin family');
    await expect(submit).toBeEnabled();
  },
};

export const SubmitExportsThenDeletesByDefault: Story = {
  args: {
    deleteTree: fn(async () => undefined),
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    const confirm = await body.findByLabelText('Type the tree name to confirm');
    await userEvent.type(confirm, 'Bourgoin family');

    await userEvent.click(body.getByRole('button', { name: 'Delete tree' }));

    await waitFor(() => {
      expect(args.exportTree).toHaveBeenCalledWith('Bourgoin family', true);
    });
    await waitFor(() => expect(args.deleteTree).toHaveBeenCalledWith('tree-1'));
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const CancelledExportAbortsDelete: Story = {
  args: {
    deleteTree: fn(async () => undefined),
    // exportToFile returns false when the user cancels the save dialog.
    exportTree: fn(async () => false),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    const confirm = await body.findByLabelText('Type the tree name to confirm');
    await userEvent.type(confirm, 'Bourgoin family');

    await userEvent.click(body.getByRole('button', { name: 'Delete tree' }));

    await waitFor(() => expect(args.exportTree).toHaveBeenCalled());
    // No delete and no close — the user gets a chance to retry.
    expect(args.deleteTree).not.toHaveBeenCalled();
    expect(args.onOpenChange).not.toHaveBeenCalledWith(false);
  },
};

export const ExportToggleOffSkipsExport: Story = {
  args: {
    deleteTree: fn(async () => undefined),
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    // Toggle off the default-on export switch.
    const exportSwitch = body.getByRole('switch', { name: /Export GEDCOM before deletion/ });
    await userEvent.click(exportSwitch);

    const confirm = await body.findByLabelText('Type the tree name to confirm');
    await userEvent.type(confirm, 'Bourgoin family');
    await userEvent.click(body.getByRole('button', { name: 'Delete tree' }));

    await waitFor(() => expect(args.deleteTree).toHaveBeenCalledWith('tree-1'));
    expect(args.exportTree).not.toHaveBeenCalled();
  },
};

export const CancelClosesWithoutDelete: Story = {
  args: {
    deleteTree: fn(async () => undefined),
    exportTree: fn(async () => true),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open delete-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const cancel = await body.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancel);

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
    expect(args.deleteTree).not.toHaveBeenCalled();
    expect(args.exportTree).not.toHaveBeenCalled();
  },
};

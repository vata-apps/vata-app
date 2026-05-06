import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '$components/ui/button';
import { EditTreeModal } from './edit-tree-modal';
import type { Tree } from '$/types/database';

type ModalArgs = ComponentProps<typeof EditTreeModal>;

const sampleTree: Tree = {
  id: '7',
  name: 'GRAMPS-Bourgoin-Aubé',
  path: '/Users/demo/trees/gramps-bourgoin-aube.db',
  description: 'Imported from GEDCOM · Lignée maternelle, Normandie',
  individualCount: 75,
  familyCount: 28,
  lastOpenedAt: '2026-04-11T10:00:00.000Z',
  createdAt: '2026-02-28T08:30:00.000Z',
  updatedAt: '2026-04-11T10:00:00.000Z',
};

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function QueryWrapper({ children }: { children: ReactNode }): JSX.Element {
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function ModalHarness({ open: argOpen, onOpenChange, ...props }: ModalArgs): JSX.Element {
  const [open, setOpen] = useState(Boolean(argOpen));
  useEffect(() => {
    setOpen(Boolean(argOpen));
  }, [argOpen]);

  return (
    <QueryWrapper>
      <Button onClick={() => setOpen(true)}>Open edit-tree modal</Button>
      <EditTreeModal
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

const meta: Meta<ModalArgs> = {
  title: 'Trees/EditTreeModal',
  component: EditTreeModal,
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
    onUpdated: fn(),
  },
  render: (args) => <ModalHarness {...args} />,
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open edit-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Edit tree');

    const nameInput = (await body.findByLabelText(/Tree name/)) as HTMLInputElement;
    await expect(nameInput.value).toBe(sampleTree.name);

    const descriptionInput = (await body.findByLabelText(/Description/)) as HTMLTextAreaElement;
    await expect(descriptionInput.value).toBe(sampleTree.description);

    await expect(body.getByText('75')).toBeInTheDocument();
    await expect(body.getByText('2026-02-28')).toBeInTheDocument();
    await expect(body.getByText('2026-04-11')).toBeInTheDocument();
  },
};

export const SubmitDisabledWhenUnchanged: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open edit-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const submit = await body.findByRole('button', { name: 'Save' });
    await expect(submit).toBeDisabled();

    // Clearing the name keeps it disabled.
    const nameInput = await body.findByLabelText(/Tree name/);
    await userEvent.clear(nameInput);
    await expect(submit).toBeDisabled();
  },
};

export const SubmitUpdatesTree: Story = {
  args: {
    updateTree: fn(async () => undefined),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open edit-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);

    const nameInput = await body.findByLabelText(/Tree name/);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Bourgoin family — Normandie');

    const descriptionInput = await body.findByLabelText(/Description/);
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Cleaned-up after first review.');

    await userEvent.click(body.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(args.updateTree).toHaveBeenCalledWith(sampleTree.id, {
        name: 'Bourgoin family — Normandie',
        description: 'Cleaned-up after first review.',
      });
    });
    await waitFor(() => expect(args.onUpdated).toHaveBeenCalledWith(sampleTree.id));
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const CancelClosesWithoutUpdating: Story = {
  args: {
    updateTree: fn(async () => undefined),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open edit-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const cancel = await body.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancel);

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
    expect(args.updateTree).not.toHaveBeenCalled();
  },
};

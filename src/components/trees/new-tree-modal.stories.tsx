import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '$components/ui/button';
import { NewTreeModal } from './new-tree-modal';

type ModalArgs = ComponentProps<typeof NewTreeModal>;

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
      <Button onClick={() => setOpen(true)}>Open new-tree modal</Button>
      <NewTreeModal
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
  title: 'Trees/NewTreeModal',
  component: NewTreeModal,
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
    open: false,
    onOpenChange: fn(),
    onCreated: fn(),
  },
  render: (args) => <ModalHarness {...args} />,
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open new-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Start a new tree');

    const radios = await body.findAllByRole('radio');
    await expect(radios).toHaveLength(2);
    const fromMe = await body.findByRole('radio', { name: /Tree from me/ });
    await expect(fromMe).toBeDisabled();
  },
};

export const SubmitDisabledWithEmptyName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open new-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const submit = await body.findByRole('button', { name: 'Create tree' });
    await expect(submit).toBeDisabled();
  },
};

export const SubmitCreatesTree: Story = {
  args: {
    createTree: fn(async () => 'tree-42'),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open new-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);

    const nameInput = await body.findByLabelText('Name');
    await userEvent.type(nameInput, 'Bourgoin family');

    const descriptionInput = await body.findByLabelText(/Description/);
    await userEvent.type(descriptionInput, "Started from grandpa's notebook");

    await userEvent.click(body.getByRole('button', { name: 'Create tree' }));

    await waitFor(() => {
      expect(args.createTree).toHaveBeenCalledWith({
        name: 'Bourgoin family',
        description: "Started from grandpa's notebook",
      });
    });
    await waitFor(() => expect(args.onCreated).toHaveBeenCalledWith('tree-42'));
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const CancelClosesWithoutCreating: Story = {
  args: {
    createTree: fn(async () => 'never'),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open new-tree modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const cancel = await body.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancel);

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
    expect(args.createTree).not.toHaveBeenCalled();
  },
};

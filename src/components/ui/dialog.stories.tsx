import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from './button';
import { Dialog } from './dialog';

type DialogArgs = ComponentProps<typeof Dialog> & { body?: ReactNode };

const meta: Meta<DialogArgs> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    a11y: {
      // Radix's focus trap renders sentinel <span data-radix-focus-guard
      // tabindex="0" aria-hidden="true">. axe-core's aria-hidden-focus rule
      // can't tell that they exist precisely so the trap can catch focus
      // exiting the dialog — they are NEVER announced or tab-stops in
      // practice. Suppress the rule on Dialog stories.
      config: {
        rules: [{ id: 'aria-hidden-focus', enabled: false }],
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    // Closed by default so the autodocs page (and individual story
    // pages) show only the trigger button — clicking it opens the
    // dialog. play() functions click the trigger explicitly before
    // asserting on the dialog content.
    open: false,
    title: 'Dialog title',
    closeLabel: 'Close',
    onOpenChange: fn(),
    children: null,
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

// Harness with local open state. The `open` arg from the Controls panel
// drives the *initial* state and any subsequent panel changes (synced via
// useEffect). User-triggered closes (Escape, close-button, click outside)
// only update the local state — the panel won't auto-update to `false`,
// but the dialog will close visually. Toggle the panel to reopen it.
//
// Storybook's `useArgs` would give us full two-way binding but it throws
// "preview hooks can only be called inside decorators and story
// functions" when an autodocs story (rendered inline in MDX) calls it,
// so we fall back to one-way arg → state sync here.
function DialogHarness({ body, children, open: argOpen, ...props }: DialogArgs) {
  const [open, setOpen] = useState(Boolean(argOpen));
  useEffect(() => {
    setOpen(Boolean(argOpen));
  }, [argOpen]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          props.onOpenChange?.(next);
        }}
      >
        {body ?? children ?? <p>Dialog body — replace with form, list, or any content.</p>}
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <DialogHarness
      {...args}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Dialog title');
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Confirm',
    description: 'This action cannot be undone.',
  },
  render: (args) => (
    <DialogHarness
      {...args}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </>
      }
    />
  ),
};

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Import GEDCOM',
    description: 'Drop a .ged file or pick one from disk to scan it before import.',
  },
  render: (args) => (
    <DialogHarness
      {...args}
      body={
        <div className="border-border bg-foreground/5 flex h-40 items-center justify-center rounded-md border border-dashed">
          <span className="text-muted-foreground text-sm">Dropzone placeholder</span>
        </div>
      }
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button>Import</Button>
        </>
      }
    />
  ),
};

export const WithFooterNote: Story = {
  args: {
    title: 'Download tree',
    description: 'Choose a format and the file is generated locally.',
    footerNote: 'File generated locally',
  },
  render: (args) => (
    <DialogHarness
      {...args}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button leadingIcon="download">Download .ged</Button>
        </>
      }
    />
  ),
};

export const ClosesOnEscape: Story = {
  args: {
    title: 'Press Escape',
  },
  render: (args) => <DialogHarness {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    // Wait for Radix to mount the Portal, focus the content, and register
    // its Escape handler. `findByRole` polls until the dialog is in the DOM.
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    // Dispatch the key on the focused element (the Dialog content) rather
    // than the document — Playwright's userEvent honors target focus.
    dialog.focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const ClosesOnCloseButton: Story = {
  args: {
    title: 'Close via button',
    closeLabel: 'Close dialog',
  },
  render: (args) => <DialogHarness {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    // `findByRole` polls until the close button is mounted and visible.
    const closeButton = await within(canvasElement.ownerDocument.body).findByRole('button', {
      name: 'Close dialog',
    });
    await userEvent.click(closeButton);
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

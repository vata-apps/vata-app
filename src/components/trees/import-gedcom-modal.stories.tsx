import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '$components/ui/button';
import type { ImportResult } from '$/managers/GedcomManager';
import { ImportGedcomModal } from './import-gedcom-modal';

type ModalArgs = ComponentProps<typeof ImportGedcomModal>;

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
      <Button onClick={() => setOpen(true)}>Open import-gedcom modal</Button>
      <ImportGedcomModal
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

const SAMPLE_CONTENT = '0 HEAD\n1 SOUR Vata\n0 @I1@ INDI\n1 NAME John /Doe/\n0 TRLR\n';

const sampleSelection = {
  path: '/tmp/family.ged',
  name: 'family.ged',
  content: SAMPLE_CONTENT,
  size: new TextEncoder().encode(SAMPLE_CONTENT).length,
  scan: {
    individuals: 142,
    families: 58,
    places: 0,
    sources: 23,
    repositories: 4,
    errors: [],
    warnings: [],
  },
};

const meta: Meta<ModalArgs> = {
  title: 'Trees/ImportGedcomModal',
  component: ImportGedcomModal,
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
    onImported: fn(),
  },
  render: (args) => <ModalHarness {...args} />,
};

export default meta;
type Story = StoryObj<ModalArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAccessibleName('Import GEDCOM');

    // Pre-selection state — dropzone visible, no stat grid yet.
    await expect(body.getByText('Drop a .ged file here, or click to browse')).toBeInTheDocument();
    const submit = body.getByRole('button', { name: 'Import tree' });
    await expect(submit).toBeDisabled();
  },
};

export const PostSelectionShowsScan: Story = {
  args: {
    initialSelection: sampleSelection,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    // File row + 4 stat cells.
    await expect(body.getByText('family.ged')).toBeInTheDocument();
    await expect(body.getByText('142')).toBeInTheDocument();
    await expect(body.getByText('58')).toBeInTheDocument();
    await expect(body.getByText('23')).toBeInTheDocument();

    // Tree name pre-filled from filename without extension.
    const nameInput = await body.findByLabelText('Tree name');
    await expect(nameInput).toHaveValue('family');

    // Submit enabled because there are no errors and the name is filled.
    const submit = body.getByRole('button', { name: 'Import tree' });
    await expect(submit).toBeEnabled();
  },
};

export const WarningsRendered: Story = {
  args: {
    initialSelection: {
      ...sampleSelection,
      scan: {
        ...sampleSelection.scan,
        warnings: ['Reference to undefined XREF: @MISSING@', 'Missing TRLR (trailer) record'],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    // Warnings collapsed inside <details>; assert the summary label.
    await expect(body.getByText('2 warnings')).toBeInTheDocument();
  },
};

export const ErrorsBlockSubmit: Story = {
  args: {
    initialSelection: {
      ...sampleSelection,
      scan: {
        ...sampleSelection.scan,
        errors: ['INDI record missing XREF'],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    await expect(body.getByText('Errors')).toBeInTheDocument();
    const submit = body.getByRole('button', { name: 'Import tree' });
    await expect(submit).toBeDisabled();
  },
};

export const SubmitCallsImport: Story = {
  args: {
    initialSelection: sampleSelection,
    importTree: fn(
      async (): Promise<ImportResult> => ({
        treeId: 'tree-42',
        stats: { individuals: 142, families: 58, places: 0, events: 200, errors: [] },
      })
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    await userEvent.click(body.getByRole('button', { name: 'Import tree' }));

    await waitFor(() => {
      expect(args.importTree).toHaveBeenCalledWith(SAMPLE_CONTENT, 'family');
    });
    await waitFor(() =>
      expect(args.onImported).toHaveBeenCalledWith({
        treeId: 'tree-42',
        stats: { individuals: 142, families: 58, places: 0, events: 200, errors: [] },
      })
    );
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};

export const CancelClosesWithoutImport: Story = {
  args: {
    importTree: fn(
      async (): Promise<ImportResult> => ({
        treeId: 'never',
        stats: { individuals: 0, families: 0, places: 0, events: 0, errors: [] },
      })
    ),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open import-gedcom modal' }));

    const body = within(canvasElement.ownerDocument.body);
    const cancel = await body.findByRole('button', { name: 'Cancel' });
    await userEvent.click(cancel);

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
    expect(args.importTree).not.toHaveBeenCalled();
  },
};

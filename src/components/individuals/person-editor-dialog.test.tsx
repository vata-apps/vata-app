import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

vi.mock('$managers/IndividualManager', () => ({
  IndividualManager: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  },
}));
vi.mock('$managers/EventManager', () => ({
  EventManager: {
    getAll: vi.fn(),
    getEventTypes: vi.fn(),
  },
}));
vi.mock('$db-tree/person-events', () => ({
  getPersonEvents: vi.fn(),
}));

import { IndividualManager } from '$managers/IndividualManager';
import { EventManager } from '$managers/EventManager';
import { PersonEditorDialog } from './person-editor-dialog';

const BIRT_TYPE = {
  id: '1',
  tag: 'BIRT',
  category: 'individual' as const,
  isSystem: true,
  customName: null,
  sortOrder: 1,
};
const DEAT_TYPE = {
  id: '3',
  tag: 'DEAT',
  category: 'individual' as const,
  isSystem: true,
  customName: null,
  sortOrder: 3,
};
const CHR_TYPE = {
  id: '2',
  tag: 'CHR',
  category: 'individual' as const,
  isSystem: true,
  customName: null,
  sortOrder: 2,
};

type DialogTestProps =
  | { mode: 'create'; onSaved?: (individualId: string) => void }
  | { mode: 'edit'; individualId: string; onSaved?: (individualId: string) => void };

function renderDialog(props: DialogTestProps) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onOpenChange = vi.fn();

  function Host() {
    const [open, setOpen] = useState(true);
    return (
      <PersonEditorDialog
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange(next);
        }}
      />
    );
  }

  render(
    <QueryClientProvider client={queryClient}>
      <Host />
    </QueryClientProvider>
  );

  return { onOpenChange };
}

describe('PersonEditorDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(EventManager.getEventTypes).mockResolvedValue([BIRT_TYPE, CHR_TYPE, DEAT_TYPE]);
  });

  it('creates a person from the given/surname fields on save', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.create).mockResolvedValue('I-0001');
    const onSaved = vi.fn();

    renderDialog({ mode: 'create', onSaved });

    await user.type(screen.getByLabelText('Given names'), 'Harry');
    await user.type(screen.getByLabelText('Surname'), 'Potter');
    await user.click(screen.getByRole('button', { name: 'Save person' }));

    await waitFor(() => expect(IndividualManager.create).toHaveBeenCalledTimes(1));
    expect(IndividualManager.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.objectContaining({ givenNames: 'Harry', surname: 'Potter' }),
      })
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('I-0001'));
  });

  it('confirms before discarding unsaved changes on cancel', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderDialog({ mode: 'create' });

    await user.type(screen.getByLabelText('Given names'), 'Harry');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Discard unsaved changes?')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Given names')).toHaveValue('Harry');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('adds a life event of a chosen type with a date, then removes it', async () => {
    const user = userEvent.setup();
    renderDialog({ mode: 'create' });

    await user.click(screen.getByRole('button', { name: 'Add event' }));
    await user.click(await screen.findByRole('button', { name: 'Baptism' }));

    expect(screen.getByText('Baptism')).toBeInTheDocument();
    const dateInputs = screen.getAllByPlaceholderText('e.g. 30 Jan 1960, abt 1960');
    const newRowDateInput = dateInputs[dateInputs.length - 1];
    await user.type(newRowDateInput, '1 Mar 1960');
    expect(newRowDateInput).toHaveValue('1 Mar 1960');

    await user.click(screen.getByRole('button', { name: 'Remove this event' }));
    expect(screen.queryByText('Baptism')).not.toBeInTheDocument();
  });

  it('renders the relations section visibly but disabled for v1', () => {
    renderDialog({ mode: 'create' });

    expect(screen.getByRole('button', { name: 'Add father' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add mother' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add spouse' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add child' })).toBeDisabled();
    expect(screen.getByText('Later stage')).toBeInTheDocument();
  });
});

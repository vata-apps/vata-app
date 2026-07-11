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
    search: vi.fn(),
    getAll: vi.fn(),
  },
}));
vi.mock('$managers/EventManager', () => ({
  EventManager: {
    getAll: vi.fn(),
    getEventTypes: vi.fn(),
  },
}));
vi.mock('$managers/FamilyManager', () => ({
  FamilyManager: {
    getParentFamily: vi.fn(),
    getSpouseFamiliesWithMembers: vi.fn(),
    saveRelations: vi.fn(),
  },
}));
vi.mock('$db-tree/person-events', () => ({
  getPersonEvents: vi.fn(),
}));

import { IndividualManager } from '$managers/IndividualManager';
import { EventManager } from '$managers/EventManager';
import { FamilyManager } from '$managers/FamilyManager';
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
    vi.mocked(FamilyManager.getParentFamily).mockResolvedValue(null);
    vi.mocked(FamilyManager.getSpouseFamiliesWithMembers).mockResolvedValue([]);
    vi.mocked(FamilyManager.saveRelations).mockResolvedValue(undefined);
    vi.mocked(IndividualManager.search).mockResolvedValue([]);
    vi.mocked(IndividualManager.getAll).mockResolvedValue([]);
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

  it('reveals the death date field only when marked deceased', async () => {
    const user = userEvent.setup();
    renderDialog({ mode: 'create' });

    // Living by default: only the birth event has a date field.
    expect(screen.getAllByPlaceholderText('e.g. 30 Jan 1960, abt 1960')).toHaveLength(1);

    await user.click(screen.getByRole('switch'));
    expect(screen.getAllByPlaceholderText('e.g. 30 Jan 1960, abt 1960')).toHaveLength(2);

    // Marking living again hides the death date field.
    await user.click(screen.getByRole('switch'));
    expect(screen.getAllByPlaceholderText('e.g. 30 Jan 1960, abt 1960')).toHaveLength(1);
  });

  it('picks an existing father via the relation picker, then removes him', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.search).mockResolvedValue([
      {
        id: 'I-0002',
        gender: 'M',
        isLiving: true,
        notes: null,
        createdAt: '',
        updatedAt: '',
        primaryName: {
          id: 'N-0002',
          individualId: 'I-0002',
          type: 'birth',
          isPrimary: true,
          prefix: null,
          givenNames: 'James',
          surname: 'Potter',
          suffix: null,
          nickname: null,
          createdAt: '',
          updatedAt: '',
        },
        names: [],
        birthEvent: null,
        deathEvent: null,
      },
    ]);
    renderDialog({ mode: 'create' });

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'James');
    await user.click(await screen.findByRole('button', { name: 'James Potter' }));

    expect(screen.getByText('James Potter')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add father' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove this relation' }));
    expect(screen.getByRole('button', { name: 'Add father' })).toBeInTheDocument();
  });

  it('creates a new spouse inline and saves relations alongside the person', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.create).mockResolvedValue('I-0001');
    renderDialog({ mode: 'create' });

    await user.type(screen.getByLabelText('Given names'), 'Harry');
    await user.click(screen.getByRole('button', { name: 'Add spouse' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'Ginny Weasley');
    await user.click(screen.getByRole('button', { name: 'Create "Ginny Weasley"' }));
    expect(screen.getByText('Ginny Weasley')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save person' }));

    await waitFor(() => expect(FamilyManager.saveRelations).toHaveBeenCalledTimes(1));
    expect(FamilyManager.saveRelations).toHaveBeenCalledWith(
      'I-0001',
      'U',
      expect.objectContaining({
        families: [
          expect.objectContaining({
            spouse: {
              createNew: { givenNames: 'Ginny', surname: 'Weasley', gender: undefined },
            },
            children: [],
          }),
        ],
      })
    );
  });

  it('adds a child to a family and removes it', async () => {
    const user = userEvent.setup();
    renderDialog({ mode: 'create' });

    await user.click(screen.getByRole('button', { name: 'Add child' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'New Kid');
    await user.click(screen.getByRole('button', { name: 'Create "New Kid"' }));

    expect(screen.getByText('New Kid')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove this relation' }));
    expect(screen.queryByText('New Kid')).not.toBeInTheDocument();
  });

  it('adds another family row', async () => {
    const user = userEvent.setup();
    renderDialog({ mode: 'create' });

    expect(screen.getAllByRole('button', { name: 'Add spouse' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Add another family' }));
    expect(screen.getAllByRole('button', { name: 'Add spouse' })).toHaveLength(2);
  });
});

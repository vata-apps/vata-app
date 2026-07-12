import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('$managers/IndividualManager', () => ({
  IndividualManager: {
    search: vi.fn(),
    getAll: vi.fn(),
  },
}));

import { IndividualManager } from '$managers/IndividualManager';
import type { EventWithDetails } from '$types/database';
import { PersonPicker, type PersonPickerSelection } from './person-picker';

/** Minimal life event carrying just the date fields `extractYear` reads. */
function datedEvent(dateOriginal: string): EventWithDetails {
  return { dateOriginal, dateSort: null } as unknown as EventWithDetails;
}

function renderPicker(props: Partial<Parameters<typeof PersonPicker>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSelect = vi.fn<(selection: PersonPickerSelection) => void>();

  render(
    <QueryClientProvider client={queryClient}>
      <PersonPicker label="Add father" onSelect={onSelect} {...props} />
    </QueryClientProvider>
  );

  return { onSelect };
}

const JOHN = {
  id: 'I-0001',
  gender: 'M' as const,
  isLiving: true,
  notes: null,
  createdAt: '',
  updatedAt: '',
  primaryName: {
    id: 'N-0001',
    individualId: 'I-0001',
    type: 'birth' as const,
    isPrimary: true,
    prefix: null,
    givenNames: 'John',
    surname: 'Doe',
    suffix: null,
    nickname: null,
    createdAt: '',
    updatedAt: '',
  },
  names: [],
  birthEvent: null,
  deathEvent: null,
};

const JANE = {
  ...JOHN,
  id: 'I-0002',
  primaryName: { ...JOHN.primaryName, id: 'N-0002', individualId: 'I-0002', givenNames: 'Jane' },
};

describe('PersonPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(IndividualManager.getAll).mockResolvedValue([]);
  });

  it('shows the existing people already in the tree before typing anything', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.getAll).mockResolvedValue([JOHN, JANE]);
    renderPicker();

    await user.click(screen.getByRole('button', { name: 'Add father' }));

    await screen.findByRole('button', { name: 'Jane Doe' });
    expect(screen.getByRole('button', { name: 'John Doe' })).toBeInTheDocument();
    expect(IndividualManager.search).not.toHaveBeenCalled();
  });

  it('shows life dates next to existing people who have birth and death years', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.getAll).mockResolvedValue([
      { ...JOHN, birthEvent: datedEvent('abt 1881'), deathEvent: datedEvent('1997') },
    ]);
    renderPicker();

    await user.click(screen.getByRole('button', { name: /Add father/ }));

    await screen.findByText(/b\. 1881.*1997/);
  });

  it('switches from the default list to a name search once typing starts', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.getAll).mockResolvedValue([JOHN, JANE]);
    vi.mocked(IndividualManager.search).mockResolvedValue([JOHN]);
    renderPicker();

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await screen.findByRole('button', { name: 'Jane Doe' });

    await user.type(screen.getByPlaceholderText('Search by name…'), 'John');

    await screen.findByRole('button', { name: 'John Doe' });
    expect(screen.queryByRole('button', { name: 'Jane Doe' })).not.toBeInTheDocument();
  });

  it('selects an existing person found by search', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.search).mockResolvedValue([JOHN]);
    const { onSelect } = renderPicker();

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'John');

    const result = await screen.findByRole('button', { name: 'John Doe' });
    await user.click(result);

    expect(onSelect).toHaveBeenCalledWith({ id: 'I-0001', displayName: 'John Doe' });
  });

  it('excludes ids passed via excludeIds from the results', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.search).mockResolvedValue([JOHN]);
    renderPicker({ excludeIds: ['I-0001'] });

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'John');

    await screen.findByText('No matches');
    expect(screen.queryByRole('button', { name: 'John Doe' })).not.toBeInTheDocument();
  });

  it('creates a new person from the typed search text', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.search).mockResolvedValue([]);
    const { onSelect } = renderPicker({ newPersonGender: 'M' });

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'Someone New');

    await screen.findByText('No matches');
    await user.click(screen.getByRole('button', { name: 'Create "Someone New"' }));

    expect(onSelect).toHaveBeenCalledWith({
      createNew: { givenNames: 'Someone', surname: 'New', gender: 'M' },
      displayName: 'Someone New',
    });
  });

  it('splits a single-word name into given names only, with no surname', async () => {
    const user = userEvent.setup();
    vi.mocked(IndividualManager.search).mockResolvedValue([]);
    const { onSelect } = renderPicker();

    await user.click(screen.getByRole('button', { name: 'Add father' }));
    await user.type(screen.getByPlaceholderText('Search by name…'), 'Madonna');

    await screen.findByText('No matches');
    await user.click(screen.getByRole('button', { name: 'Create "Madonna"' }));

    expect(onSelect).toHaveBeenCalledWith({
      createNew: { givenNames: 'Madonna', gender: undefined },
      displayName: 'Madonna',
    });
  });
});

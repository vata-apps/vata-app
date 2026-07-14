import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';

import { IndividualsPage } from './IndividualsPage';
import { IndividualManager } from '$managers/IndividualManager';
import type { IndividualWithDetails, Name } from '$types/database';

vi.mock('$managers/IndividualManager', () => ({
  IndividualManager: {
    getAll: vi.fn(),
  },
}));

const mockedGetAll = IndividualManager.getAll as ReturnType<typeof vi.fn>;

const TREE_ID = 'T-1';

function name(overrides: Partial<Name> = {}): Name {
  return {
    id: '1',
    individualId: 'I-1',
    type: 'birth',
    prefix: null,
    givenNames: 'John',
    surname: 'Doe',
    suffix: null,
    nickname: null,
    isPrimary: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function person(
  overrides: Partial<Omit<IndividualWithDetails, 'primaryName'>> & {
    primaryName?: Partial<Name>;
  } = {}
): IndividualWithDetails {
  const id = overrides.id ?? 'I-1';
  const primaryNameOverride = overrides.primaryName ?? {};
  return {
    id,
    gender: 'M',
    isLiving: true,
    notes: null,
    createdAt: '',
    updatedAt: '',
    birthEvent: overrides.birthEvent ?? null,
    deathEvent: overrides.deathEvent ?? null,
    ...overrides,
    primaryName: name({ individualId: id, ...primaryNameOverride }),
    names: overrides.names ?? [name({ individualId: id, ...primaryNameOverride })],
  };
}

function makeRouter(initialPath = `/tree/${TREE_ID}/individuals`): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute();
  const treeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tree/$treeId',
    component: () => <Outlet />,
  });
  const individualsRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'individuals',
    component: () => <IndividualsPage treeId={treeRoute.useParams().treeId} />,
  });
  const individualRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'individual/$individualId',
    component: () => <div>Individual detail</div>,
  });
  const routeTree = rootRoute.addChildren([
    treeRoute.addChildren([individualsRoute, individualRoute]),
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

function renderPage(router = makeRouter()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
  };
}

async function getBodyRows() {
  const table = await screen.findByRole('table', { name: 'People' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

function surname(row: HTMLElement): string {
  return within(row).getByRole('rowheader').textContent ?? '';
}

function firstName(row: HTMLElement): string {
  // Cells are: gender, first name, birth date, birth place, death date, death place.
  return within(row).getAllByRole('cell')[1]?.textContent ?? '';
}

describe('IndividualsPage', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
  });

  it('sorts by surname ascending by default', async () => {
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-2', primaryName: { surname: 'Zebra', givenNames: 'Anna' } }),
      person({ id: 'I-1', primaryName: { surname: 'Able', givenNames: 'Zoe' } }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(surname(rows[0])).toBe('Able');
    expect(surname(rows[1])).toBe('Zebra');
  });

  it('toggles surname sort direction', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-2', primaryName: { surname: 'Able', givenNames: 'Anna' } }),
      person({ id: 'I-1', primaryName: { surname: 'Zebra', givenNames: 'Zoe' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const surnameHeader = screen.getByRole('button', { name: 'Surname' });
    expect(surnameHeader.parentElement).toHaveAttribute('aria-sort', 'ascending');

    await user.click(surnameHeader);
    await waitFor(() => {
      expect(surnameHeader.parentElement).toHaveAttribute('aria-sort', 'descending');
    });

    const rows = await getBodyRows();
    expect(surname(rows[0])).toBe('Zebra');
    expect(surname(rows[1])).toBe('Able');
  });

  it('sorts by first name and announces aria-sort', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-2', primaryName: { surname: 'B', givenNames: 'Zoe' } }),
      person({ id: 'I-1', primaryName: { surname: 'A', givenNames: 'Anna' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const firstNameHeader = screen.getByRole('button', { name: 'First name' });
    expect(firstNameHeader.parentElement).toHaveAttribute('aria-sort', 'none');

    await user.click(firstNameHeader);
    await waitFor(() => {
      expect(firstNameHeader.parentElement).toHaveAttribute('aria-sort', 'ascending');
    });

    const rows = await getBodyRows();
    expect(firstName(rows[0])).toBe('Anna');
    expect(firstName(rows[1])).toBe('Zoe');
  });

  it('keeps unknown values at the bottom in both sort directions', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-2', primaryName: { surname: 'Zebra', givenNames: 'Anna' } }),
      person({ id: 'I-unknown', primaryName: { surname: '', givenNames: '' } }),
      person({ id: 'I-1', primaryName: { surname: 'Able', givenNames: 'Zoe' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const surnameHeader = screen.getByRole('button', { name: 'Surname' });
    let rows = await getBodyRows();
    expect(surname(rows[2])).toBe('Unknown');

    await user.click(surnameHeader);
    await waitFor(() => {
      expect(surnameHeader.parentElement).toHaveAttribute('aria-sort', 'descending');
    });
    rows = await getBodyRows();
    expect(surname(rows[2])).toBe('Unknown');
  });

  it('shows the empty-tree state with an add-person action', async () => {
    mockedGetAll.mockResolvedValue([]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'People' });
    await waitFor(() => {
      expect(within(table).getByText('No people yet')).toBeInTheDocument();
    });
    expect(within(table).getByRole('button', { name: 'Add person' })).toBeInTheDocument();
  });

  it('shows the no-matches state with a clear-filters action', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-1', primaryName: { surname: 'Doe', givenNames: 'John' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'noone');
    await waitFor(() => {
      expect(screen.getByText('No people match your filters')).toBeInTheDocument();
    });
    const table = screen.getByRole('table', { name: 'People' });
    expect(within(table).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('shows a distinct error state when loading fails', async () => {
    mockedGetAll.mockRejectedValue(new Error('boom'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });

  it('renders a dismissible chip for each active filter', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-1', gender: 'M', primaryName: { surname: 'Doe', givenNames: 'John' } }),
      person({ id: 'I-2', gender: 'F', primaryName: { surname: 'Doe', givenNames: 'Jane' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const sexSelect = screen.getByRole('combobox', { name: 'Sex' });
    await user.click(sexSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'Male' }));

    await waitFor(() => {
      expect(screen.getByText('Sex: Male')).toBeInTheDocument();
    });

    const rowsBefore = await getBodyRows();
    expect(rowsBefore).toHaveLength(1);

    const removeButton = screen.getByRole('button', { name: /Remove Sex: Male/ });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Sex: Male')).not.toBeInTheDocument();
    });

    const rowsAfter = await getBodyRows();
    expect(rowsAfter).toHaveLength(2);
  });

  it('clears all active filters with the Clear-all button', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-1', gender: 'M', primaryName: { surname: 'Doe', givenNames: 'John' } }),
      person({ id: 'I-2', gender: 'F', primaryName: { surname: 'Doe', givenNames: 'Jane' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'People' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'Jane');

    const sexSelect = screen.getByRole('combobox', { name: 'Sex' });
    await user.click(sexSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'Female' }));

    await waitFor(() => {
      expect(screen.getByText('Name: Jane')).toBeInTheDocument();
      expect(screen.getByText('Sex: Female')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      expect(screen.queryByText('Name: Jane')).not.toBeInTheDocument();
      expect(screen.queryByText('Sex: Female')).not.toBeInTheDocument();
    });

    await waitFor(async () => {
      const rows = await getBodyRows();
      expect(rows).toHaveLength(2);
    });
  });

  it('activates a row by keyboard on the primary link', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      person({ id: 'I-1', primaryName: { surname: 'Doe', givenNames: 'John' } }),
    ]);

    const router = makeRouter();
    renderPage(router);

    const link = await screen.findByRole('link', { name: 'Doe' });
    link.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/tree/${TREE_ID}/individual/I-1`);
    });
  });
});

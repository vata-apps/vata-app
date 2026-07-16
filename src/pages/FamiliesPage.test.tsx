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

import { FamiliesPage } from './FamiliesPage';
import { FamilyManager } from '$managers/FamilyManager';
import type { FamilyWithMembers, IndividualWithDetails, Name } from '$types/database';

vi.mock('$managers/FamilyManager', () => ({
  FamilyManager: {
    getAll: vi.fn(),
  },
}));

const mockedGetAll = FamilyManager.getAll as ReturnType<typeof vi.fn>;

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
    birthEvent: null,
    deathEvent: null,
    ...overrides,
    primaryName: name({ individualId: id, ...primaryNameOverride }),
    names: overrides.names ?? [name({ individualId: id, ...primaryNameOverride })],
  };
}

function family(
  overrides: Partial<Omit<FamilyWithMembers, 'husband' | 'wife' | 'children'>> & {
    husband?: Partial<Name> | null;
    wife?: Partial<Name> | null;
    children?: IndividualWithDetails[];
  } = {}
): FamilyWithMembers {
  const { husband: husbandOverride, wife: wifeOverride, children, ...rest } = overrides;
  const id = rest.id ?? 'F-1';
  const husband =
    husbandOverride === null
      ? null
      : person({
          id: 'I-H',
          primaryName: { surname: 'Doe', givenNames: 'John', ...husbandOverride },
        });
  const wife =
    wifeOverride === null
      ? null
      : person({
          id: 'I-W',
          primaryName: { surname: 'Smith', givenNames: 'Jane', ...wifeOverride },
        });
  return {
    id,
    notes: null,
    createdAt: '',
    updatedAt: '',
    husband,
    wife,
    children: children ?? [],
    marriageEvent: null,
    ...rest,
  };
}

function makeRouter(initialPath = `/tree/${TREE_ID}/families`): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute();
  const treeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tree/$treeId',
    component: () => <Outlet />,
  });
  const familiesRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'families',
    component: () => <FamiliesPage treeId={treeRoute.useParams().treeId} />,
  });
  const familyRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'family/$familyId',
    component: () => <div>Family detail</div>,
  });
  const routeTree = rootRoute.addChildren([treeRoute.addChildren([familiesRoute, familyRoute])]);

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
  const table = await screen.findByRole('table', { name: 'Families' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

function husband(row: HTMLElement): string {
  return within(row).getByRole('rowheader').textContent ?? '';
}

describe('FamiliesPage', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
  });

  it('renders the expected columns', async () => {
    mockedGetAll.mockResolvedValue([family()]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'Families' });
    expect(within(table).getByRole('button', { name: 'Husband' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Wife' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Children' })).toBeInTheDocument();
  });

  it('sorts by husband ascending by default', async () => {
    mockedGetAll.mockResolvedValue([
      family({ id: 'F-2', husband: { surname: 'Zebra' } }),
      family({ id: 'F-1', husband: { surname: 'Able' } }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(husband(rows[0])).toBe('Able, John');
    expect(husband(rows[1])).toBe('Zebra, John');
  });

  it('filters by spouse name search', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      family({ id: 'F-1', husband: { surname: 'Doe', givenNames: 'John' } }),
      family({ id: 'F-2', wife: { surname: 'Doe', givenNames: 'Jane' } }),
      family({ id: 'F-3', husband: { surname: 'Able', givenNames: 'Zoe' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Families' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'Doe');

    const table = await screen.findByRole('table', { name: 'Families' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
  });

  it('filters by spouse completeness', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      family({ id: 'F-1', husband: { surname: 'Doe' }, wife: { surname: 'Smith' } }),
      family({ id: 'F-2', husband: { surname: 'Able' }, wife: null }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Families' });

    const spousesSelect = screen.getByRole('combobox', { name: 'Spouses' });
    await user.click(spousesSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'Both spouses' }));

    const rows = await getBodyRows();
    expect(rows).toHaveLength(1);
    expect(husband(rows[0])).toBe('Doe, John');
  });

  it('shows a no-matches state with a clear action', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([family()]);

    renderPage();
    await screen.findByRole('table', { name: 'Families' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'noone');

    await waitFor(() => {
      expect(screen.getByText('No families match your filters')).toBeInTheDocument();
    });
    const table = screen.getByRole('table', { name: 'Families' });
    expect(within(table).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});

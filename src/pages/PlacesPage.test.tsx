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

import { PlacesPage } from './PlacesPage';
import { PlaceManager } from '$managers/PlaceManager';
import * as placesDb from '$db-tree/places';
import type { Place, PlaceType } from '$types/database';

vi.mock('$managers/PlaceManager', () => ({
  PlaceManager: {
    getAll: vi.fn(),
  },
}));

vi.mock('$db-tree/places', async () => {
  const actual = await vi.importActual<typeof placesDb>('$db-tree/places');
  return {
    ...actual,
    getAllPlaceTypes: vi.fn(),
  };
});

const mockedGetAll = PlaceManager.getAll as ReturnType<typeof vi.fn>;
const mockedGetAllPlaceTypes = placesDb.getAllPlaceTypes as ReturnType<typeof vi.fn>;

const TREE_ID = 'T-1';

const PLACE_TYPES: PlaceType[] = [
  { id: 'PT-1', tag: 'CITY', isSystem: true, customName: null, sortOrder: 1 },
  { id: 'PT-2', tag: 'CTRY', isSystem: true, customName: null, sortOrder: 2 },
];

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: 'P-1',
    name: 'Springfield',
    fullName: 'Springfield, USA',
    placeTypeId: 'PT-1',
    parentId: null,
    latitude: null,
    longitude: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makeRouter(initialPath = `/tree/${TREE_ID}/places`): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute();
  const treeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tree/$treeId',
    component: () => <Outlet />,
  });
  const placesRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'places',
    component: () => <PlacesPage treeId={treeRoute.useParams().treeId} />,
  });
  const placeRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'place/$placeId',
    component: () => <div>Place detail</div>,
  });
  const routeTree = rootRoute.addChildren([treeRoute.addChildren([placesRoute, placeRoute])]);

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
  const table = await screen.findByRole('table', { name: 'Places' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

function nameCell(row: HTMLElement): string {
  return within(row).getByRole('rowheader').textContent ?? '';
}

describe('PlacesPage', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
    mockedGetAllPlaceTypes.mockReset();
    mockedGetAllPlaceTypes.mockResolvedValue(PLACE_TYPES);
  });

  it('renders the expected columns', async () => {
    mockedGetAll.mockResolvedValue([place()]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'Places' });
    expect(within(table).getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Type' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Parent' })).toBeInTheDocument();
  });

  it('sorts by name ascending by default', async () => {
    mockedGetAll.mockResolvedValue([
      place({ id: 'P-2', name: 'Zoo', fullName: 'Zoo, USA' }),
      place({ id: 'P-1', name: 'Able', fullName: 'Able, USA' }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(nameCell(rows[0])).toBe('Able');
    expect(nameCell(rows[1])).toBe('Zoo');
  });

  it('filters by name search', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      place({ id: 'P-1', name: 'Springfield', fullName: 'Springfield, USA' }),
      place({ id: 'P-2', name: 'Springdale', fullName: 'Springdale, USA' }),
      place({ id: 'P-3', name: 'Boston', fullName: 'Boston, USA' }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Places' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'Spring');

    await waitFor(() => {
      expect(screen.getByText('Name: Spring')).toBeInTheDocument();
    });

    const table = await screen.findByRole('table', { name: 'Places' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
  });

  it('filters by place type', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      place({ id: 'P-1', name: 'Springfield', placeTypeId: 'PT-1' }),
      place({ id: 'P-2', name: 'USA', placeTypeId: 'PT-2' }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Places' });

    const typeSelect = screen.getByRole('combobox', { name: 'Type' });
    await user.click(typeSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'CTRY' }));

    await waitFor(() => {
      expect(screen.getByText('Type: CTRY')).toBeInTheDocument();
    });

    const table = await screen.findByRole('table', { name: 'Places' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(2); // header + 1 data row
    });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
    expect(nameCell(rows[0])).toBe('USA');
  });

  it('shows a no-matches state with a clear action', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([place()]);

    renderPage();
    await screen.findByRole('table', { name: 'Places' });

    const search = screen.getByRole('textbox', { name: 'Name' });
    await user.type(search, 'noone');

    await waitFor(() => {
      expect(screen.getByText('No places match your filters')).toBeInTheDocument();
    });
    const table = screen.getByRole('table', { name: 'Places' });
    expect(within(table).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});

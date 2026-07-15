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

import { EventsPage } from './EventsPage';
import { EventManager } from '$managers/EventManager';
import type { EventListEntry, EventType, Place } from '$types/database';

vi.mock('$managers/EventManager', () => ({
  EventManager: {
    getAll: vi.fn(),
  },
}));

const mockedGetAll = EventManager.getAll as ReturnType<typeof vi.fn>;

const TREE_ID = 'T-1';

const BIRTH_TYPE: EventType = {
  id: 'ET-1',
  tag: 'BIRT',
  category: 'individual',
  isSystem: true,
  customName: null,
  sortOrder: 1,
};

const MARRIAGE_TYPE: EventType = {
  id: 'ET-2',
  tag: 'MARR',
  category: 'family',
  isSystem: true,
  customName: null,
  sortOrder: 2,
};

const PLACE_BOSTON: Place = {
  id: 'P-1',
  name: 'Boston',
  fullName: 'Boston, MA, USA',
  placeTypeId: null,
  parentId: null,
  latitude: null,
  longitude: null,
  notes: null,
  createdAt: '',
  updatedAt: '',
};

function event(overrides: Partial<EventListEntry> = {}): EventListEntry {
  return {
    id: 'E-1',
    eventTypeId: BIRTH_TYPE.id,
    eventType: BIRTH_TYPE,
    dateOriginal: '1900-01-01',
    dateSort: '1900-01-01',
    placeId: PLACE_BOSTON.id,
    place: PLACE_BOSTON,
    description: null,
    notes: null,
    participants: [],
    principals: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makeRouter(initialPath = `/tree/${TREE_ID}/events`): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute();
  const treeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tree/$treeId',
    component: () => <Outlet />,
  });
  const eventsRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'events',
    component: () => <EventsPage treeId={treeRoute.useParams().treeId} />,
  });
  const eventRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'event/$eventId',
    component: () => <div>Event detail</div>,
  });
  const routeTree = rootRoute.addChildren([treeRoute.addChildren([eventsRoute, eventRoute])]);

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
  const table = await screen.findByRole('table', { name: 'Events' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

function typeCell(row: HTMLElement): string {
  return within(row).getByRole('rowheader').textContent ?? '';
}

describe('EventsPage', () => {
  beforeEach(() => {
    mockedGetAll.mockReset();
  });

  it('renders the expected columns', async () => {
    mockedGetAll.mockResolvedValue([event()]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'Events' });
    expect(within(table).getByRole('button', { name: 'Type' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Principals' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Place' })).toBeInTheDocument();
  });

  it('preserves the chronological order by default', async () => {
    mockedGetAll.mockResolvedValue([
      event({ id: 'E-1', eventType: BIRTH_TYPE, dateSort: '1900-01-01' }),
      event({ id: 'E-2', eventType: MARRIAGE_TYPE, dateSort: '1950-06-15' }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(typeCell(rows[0])).toBe('Birth');
    expect(typeCell(rows[1])).toBe('Marriage');
  });

  it('filters by event type', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      event({ id: 'E-1', eventType: BIRTH_TYPE }),
      event({ id: 'E-2', eventType: MARRIAGE_TYPE }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Events' });

    const typeSelect = screen.getByRole('combobox', { name: 'Type' });
    await user.click(typeSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'Marriage' }));

    await waitFor(() => {
      expect(screen.getByText('Type: Marriage')).toBeInTheDocument();
    });

    const table = await screen.findByRole('table', { name: 'Events' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(2); // header + 1 data row
    });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
    expect(typeCell(rows[0])).toBe('Marriage');
  });

  it('filters by place', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      event({ id: 'E-1', place: PLACE_BOSTON }),
      event({ id: 'E-2', place: { ...PLACE_BOSTON, id: 'P-2', name: 'Chicago' } }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Events' });

    const placeSelect = screen.getByRole('combobox', { name: 'Place' });
    await user.click(placeSelect);
    const popup = await screen.findByRole('listbox');
    await user.click(within(popup).getByRole('option', { name: 'Boston' }));

    await waitFor(() => {
      expect(screen.getByText('Place: Boston')).toBeInTheDocument();
    });

    const table = await screen.findByRole('table', { name: 'Events' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(2); // header + 1 data row
    });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
  });

  it('shows a no-matches state with a clear action', async () => {
    const user = userEvent.setup();
    mockedGetAll.mockResolvedValue([
      event({ id: 'E-1', eventType: BIRTH_TYPE, place: PLACE_BOSTON }),
      event({
        id: 'E-2',
        eventType: MARRIAGE_TYPE,
        place: { ...PLACE_BOSTON, id: 'P-2', name: 'Chicago' },
      }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Events' });

    const typeSelect = screen.getByRole('combobox', { name: 'Type' });
    await user.click(typeSelect);
    const typePopup = await screen.findByRole('listbox');
    await user.click(within(typePopup).getByRole('option', { name: 'Marriage' }));

    await waitFor(() => {
      expect(screen.getByText('Type: Marriage')).toBeInTheDocument();
    });

    const placeSelect = screen.getByRole('combobox', { name: 'Place' });
    await user.click(placeSelect);
    const placePopup = await screen.findByRole('listbox');
    await user.click(within(placePopup).getByRole('option', { name: 'Boston' }));

    await waitFor(() => {
      expect(screen.getByText('No events match your filters')).toBeInTheDocument();
    });
    const table = screen.getByRole('table', { name: 'Events' });
    expect(within(table).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});

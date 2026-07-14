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

import { PersonEventsPage } from './PersonEventsPage';
import * as personEventsDb from '$db-tree/person-events';
import type { PersonEventEntry } from '$db-tree/person-events';
import type { EventType, Place } from '$types/database';

vi.mock('$db-tree/person-events', async () => {
  const actual = await vi.importActual<typeof personEventsDb>('$db-tree/person-events');
  return {
    ...actual,
    getPersonEvents: vi.fn(),
  };
});

const mockedGetPersonEvents = personEventsDb.getPersonEvents as ReturnType<typeof vi.fn>;

const TREE_ID = 'T-1';
const INDIVIDUAL_ID = 'I-1';

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

const WITNESS_ROLE = 'witness';

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

function personEvent(overrides: Partial<PersonEventEntry> = {}): PersonEventEntry {
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
    scope: 'principal',
    role: null,
    counterpartyName: null,
    principals: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makeRouter(
  initialPath = `/tree/${TREE_ID}/individual/${INDIVIDUAL_ID}/events`
): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute();
  const treeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tree/$treeId',
    component: () => <Outlet />,
  });
  const individualRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'individual/$individualId',
    component: () => <Outlet />,
  });
  const eventsRoute = createRoute({
    getParentRoute: () => individualRoute,
    path: 'events',
    component: () => (
      <PersonEventsPage
        treeId={treeRoute.useParams().treeId}
        individualId={individualRoute.useParams().individualId}
      />
    ),
  });
  const eventRoute = createRoute({
    getParentRoute: () => treeRoute,
    path: 'event/$eventId',
    component: () => <div>Event detail</div>,
  });
  const routeTree = rootRoute.addChildren([
    treeRoute.addChildren([individualRoute.addChildren([eventsRoute]), eventRoute]),
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
  const table = await screen.findByRole('table', { name: 'Events' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

function typeCell(row: HTMLElement): string {
  return within(row).getByRole('rowheader').textContent ?? '';
}

describe('PersonEventsPage', () => {
  beforeEach(() => {
    mockedGetPersonEvents.mockReset();
  });

  it('renders the expected columns', async () => {
    mockedGetPersonEvents.mockResolvedValue([personEvent()]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'Events' });
    expect(within(table).getByRole('button', { name: 'Type' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Date' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Place' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Details' })).toBeInTheDocument();
  });

  it('sorts by date ascending by default', async () => {
    mockedGetPersonEvents.mockResolvedValue([
      personEvent({ id: 'E-1', dateSort: '1900-01-01', eventType: BIRTH_TYPE }),
      personEvent({ id: 'E-2', dateSort: '1950-06-15', eventType: MARRIAGE_TYPE }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(typeCell(rows[0])).toBe('Birth');
    expect(typeCell(rows[1])).toBe('Marriage');
  });

  it('narrows the list with the scope control in the toolbar', async () => {
    const user = userEvent.setup();
    mockedGetPersonEvents.mockResolvedValue([
      personEvent({ id: 'E-1', scope: 'principal', eventType: BIRTH_TYPE }),
      personEvent({
        id: 'E-2',
        scope: 'secondary',
        role: WITNESS_ROLE,
        eventType: MARRIAGE_TYPE,
      }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Events' });

    const scopeGroup = screen.getByRole('radiogroup', { name: 'Scope' });
    const allRadio = within(scopeGroup).getByRole('radio', { name: 'All roles' });
    await user.click(allRadio);

    await waitFor(() => {
      expect(screen.getByText('Scope: All roles')).toBeInTheDocument();
    });

    const rows = await getBodyRows();
    expect(rows).toHaveLength(2);
  });

  it('resets the scope to personal with the chip remove button', async () => {
    const user = userEvent.setup();
    mockedGetPersonEvents.mockResolvedValue([
      personEvent({ id: 'E-1', scope: 'principal', eventType: BIRTH_TYPE }),
      personEvent({
        id: 'E-2',
        scope: 'union',
        counterpartyName: 'Jane Doe',
        eventType: MARRIAGE_TYPE,
      }),
    ]);

    renderPage();
    await screen.findByRole('table', { name: 'Events' });

    const scopeGroup = screen.getByRole('radiogroup', { name: 'Scope' });
    await user.click(within(scopeGroup).getByRole('radio', { name: 'Principal' }));

    await waitFor(() => {
      expect(screen.getByText('Scope: Principal')).toBeInTheDocument();
    });

    let rows = await getBodyRows();
    expect(rows).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /Remove Scope: Principal/ }));

    await waitFor(() => {
      expect(screen.queryByText('Scope: Principal')).not.toBeInTheDocument();
    });

    rows = await getBodyRows();
    expect(rows).toHaveLength(2);
  });
});

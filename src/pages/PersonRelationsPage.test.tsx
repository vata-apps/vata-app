import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';

import { PersonRelationsPage } from './PersonRelationsPage';
import * as personRelationsModule from '$components/person-relations/build-relations';
import * as personRelationsDb from '$db-tree/person-relations';
import type { RelationRow } from '$components/person-relations/relations-types';

vi.mock('$components/person-relations/build-relations', async () => {
  const actual = await vi.importActual<typeof personRelationsModule>(
    '$components/person-relations/build-relations'
  );
  return {
    ...actual,
    buildPersonRelations: vi.fn(),
  };
});

vi.mock('$db-tree/person-relations', async () => {
  const actual = await vi.importActual<typeof personRelationsDb>('$db-tree/person-relations');
  return {
    ...actual,
    getPersonRelations: vi.fn(),
  };
});

const mockedGetPersonRelations = personRelationsDb.getPersonRelations as ReturnType<typeof vi.fn>;
const mockedBuildPersonRelations = personRelationsModule.buildPersonRelations as ReturnType<
  typeof vi.fn
>;

const TREE_ID = 'T-1';
const INDIVIDUAL_ID = 'I-1';

function relation(overrides: Partial<RelationRow> = {}): RelationRow {
  return {
    id: 'I-2',
    name: 'Jane Doe',
    relation: 'wife',
    bornYear: 1900,
    deathYear: 1980,
    ...overrides,
  };
}

function makeRouter(
  initialPath = `/tree/${TREE_ID}/individual/${INDIVIDUAL_ID}/relations`
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
  const relationsRoute = createRoute({
    getParentRoute: () => individualRoute,
    path: 'relations',
    component: () => (
      <PersonRelationsPage
        treeId={treeRoute.useParams().treeId}
        individualId={individualRoute.useParams().individualId}
      />
    ),
  });
  const routeTree = rootRoute.addChildren([
    treeRoute.addChildren([individualRoute.addChildren([relationsRoute])]),
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
  const table = await screen.findByRole('table', { name: 'Relations' });
  await waitFor(() => {
    expect(within(table).getAllByRole('row').length).toBeGreaterThan(1);
  });
  return within(table).getAllByRole('row').slice(1);
}

describe('PersonRelationsPage', () => {
  beforeEach(() => {
    mockedGetPersonRelations.mockReset();
    mockedBuildPersonRelations.mockReset();
    mockedBuildPersonRelations.mockImplementation((relations) => relations);
  });

  it('renders the expected columns', async () => {
    mockedGetPersonRelations.mockResolvedValue([relation()]);

    renderPage();

    const table = await screen.findByRole('table', { name: 'Relations' });
    expect(within(table).getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Relation' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Born' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Died' })).toBeInTheDocument();
  });

  it('sorts by name ascending by default', async () => {
    mockedGetPersonRelations.mockResolvedValue([
      relation({ id: 'I-3', name: 'Zoe Zebra', relation: 'daughter' }),
      relation({ id: 'I-2', name: 'Anna Able', relation: 'wife' }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(within(rows[0]).getByRole('rowheader').textContent).toBe('Anna Able');
    expect(within(rows[1]).getByRole('rowheader').textContent).toBe('Zoe Zebra');
  });

  it('links recorded relations to their overview', async () => {
    mockedGetPersonRelations.mockResolvedValue([relation({ id: 'I-2', name: 'Jane Doe' })]);

    renderPage();

    const rows = await getBodyRows();
    const link = within(rows[0]).getByRole('link');
    expect(link).toHaveAttribute('href', '/tree/T-1/individual/I-2');
  });

  it('does not link unrecorded parent rows', async () => {
    mockedGetPersonRelations.mockResolvedValue([
      relation({ id: null, name: 'Father unknown', relation: 'father' }),
    ]);

    renderPage();

    const rows = await getBodyRows();
    expect(within(rows[0]).queryByRole('link')).not.toBeInTheDocument();
    expect(within(rows[0]).getByText('Father unknown')).toBeInTheDocument();
  });
});

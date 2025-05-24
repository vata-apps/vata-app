import { fetchIndividuals } from "@/api";
import { GenderIcon } from "@/components/GenderIcon";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { IndividualWithNames } from "@/types";
import { IndividualSortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Group, Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

/**
 * Helper function to safely extract first element from array or return the value
 */
function getFirstOrValue<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

type IndividualEvent = {
  id: string;
  date: string | null;
  type_id: string;
  place_id: string | null;
  places: {
    id: string;
    name: string;
  } | null;
  individual_event_types: {
    id: string;
    name: string;
  };
};

type Individual = IndividualWithNames & {
  individual_events: IndividualEvent[];
};

type TableState = {
  globalFilter: string;
  sorting: { id: string; desc: boolean } | null;
  pagination: { pageIndex: number; pageSize: number };
};

const columns: ColumnDef<Individual, unknown>[] = [
  {
    accessorKey: "names",
    header: "Name",
    cell: ({ row, table }) => {
      const sorting = table.getState().sorting;
      const part = sorting?.[0]?.id === "last_name" ? "fullInverted" : "full";
      return displayName(row.original.names, { part });
    },
    id: "name",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <Group gap="sm">
        <GenderIcon size={16} gender={row.original.gender} />
        {capitalize(row.original.gender)}
      </Group>
    ),
    size: 128,
  },
  {
    accessorKey: "birth",
    header: "Birth",
    cell: ({ row }) => {
      const birthEvent = row.original.individual_events.find(
        (event) => event.individual_event_types.name === "birth",
      );
      if (!birthEvent) return null;
      return (
        <Stack gap={0}>
          <TableData.Text>{birthEvent.date}</TableData.Text>
          {birthEvent.places && birthEvent.places.name ? (
            <TableData.Text c="dimmed">{birthEvent.places.name}</TableData.Text>
          ) : (
            <TableData.Text c="dimmed" fs="italic">
              Unknown location
            </TableData.Text>
          )}
        </Stack>
      );
    },
  },
  {
    accessorKey: "death",
    header: "Death",
    cell: ({ row }) => {
      const deathEvent = row.original.individual_events.find(
        (event) => event.individual_event_types.name === "death",
      );
      if (!deathEvent) return null;
      return (
        <Stack gap={0}>
          <TableData.Text>{deathEvent.date}</TableData.Text>
          {deathEvent.places && deathEvent.places.name ? (
            <TableData.Text c="dimmed">{deathEvent.places.name}</TableData.Text>
          ) : (
            <TableData.Text c="dimmed" fs="italic">
              Unknown location
            </TableData.Text>
          )}
        </Stack>
      );
    },
  },
];

function IndividualsPage() {
  const navigate = useNavigate();

  const fetchTableData = async (state: TableState) => {
    const response = await fetchIndividuals({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as IndividualSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "last_name", direction: "asc" },
    });

    // Transform the data to handle Supabase's array returns for joined data
    const transformedData = response.data.map((individual: unknown) => {
      const ind = individual as Record<string, unknown>;
      return {
        ...ind,
        individual_events: ((ind.individual_events as unknown[]) || []).map(
          (event: unknown) => {
            const evt = event as Record<string, unknown>;
            return {
              ...evt,
              individual_event_types: getFirstOrValue(
                evt.individual_event_types as
                  | { id: string; name: string }
                  | { id: string; name: string }[],
              ),
              places: getFirstOrValue(
                evt.places as
                  | { id: string; name: string }
                  | { id: string; name: string }[]
                  | null,
              ),
            };
          },
        ),
      };
    });

    return {
      data: transformedData as Individual[],
      total: response.total ?? 0,
    };
  };

  const handleRowClick = (individual: Individual) => {
    navigate({ to: `/individuals/${individual.id}` });
  };

  return (
    <Stack h="100%">
      <PageHeader title="Individuals" />

      <TableData<Individual>
        queryKey={["individuals"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "last_name", desc: false }}
        onRowClick={handleRowClick}
      >
        <TableData.Toolbar>
          <TableData.AddButton to="/individuals/new" />
          <TableData.Search placeholder="Search by name" />
          <TableData.SortBy
            sortOptions={[
              { desc: false, id: "first_name", label: "First Name (A - Z)" },
              { desc: true, id: "first_name", label: "First Name (Z - A)" },
              { desc: false, id: "last_name", label: "Last Name (A - Z)" },
              { desc: true, id: "last_name", label: "Last Name (Z - A)" },
            ]}
          />
        </TableData.Toolbar>

        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default IndividualsPage;

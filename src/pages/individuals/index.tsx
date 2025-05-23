import { fetchIndividuals } from "@/api";
import { GenderIcon } from "@/components/GenderIcon";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { Enums, Tables } from "@/database.types";
import { IndividualSortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Button, Group, Stack } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

type Name = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

type Individual = {
  id: string;
  gender: Enums<"gender">;
  names: Name[];
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
      return (
        <Button
          component={Link}
          to={`/individuals/${row.original.id}`}
          size="compact-sm"
          variant="transparent"
        >
          {displayName(row.original.names, { part })}
        </Button>
      );
    },
    id: "name",
    size: 380,
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
    // size: 128,
  },
];

function IndividualsPage() {
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

    return {
      data: response.data as Individual[],
      totalCount: response.total ?? 0,
    };
  };

  return (
    <Stack h="100%">
      <PageHeader title="Individuals" />

      <TableData<Individual>
        queryKey={["individuals"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "last_name", desc: false }}
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

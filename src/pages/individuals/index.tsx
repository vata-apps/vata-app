import { fetchIndividuals } from "@/api";
import { GenderIcon } from "@/components/GenderIcon";
import { TableData } from "@/components/table-data";
import { Button } from "@/components/ui/button";
import { Enums, Tables } from "@/database.types";
import { IndividualSortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { Stack, Title } from "@mantine/core";
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
    accessorKey: "gender",
    header: "",
    cell: ({ row }) => (
      <GenderIcon className="w-4 h-4" gender={row.original.gender} />
    ),
    size: 32,
    enableSorting: false,
  },
  {
    accessorKey: "names",
    header: "First Name",
    cell: ({ row }) => displayName(row.original.names, { part: "first" }),
    id: "first_name",
    size: 250,
  },
  {
    accessorKey: "names",
    header: "Last Name",
    cell: ({ row }) => displayName(row.original.names, { part: "last" }),
    id: "last_name",
    size: 250,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="secondary" size="sm" asChild>
        <Link
          to="/individuals/$individualId"
          params={{ individualId: row.original.id }}
        >
          View
        </Link>
      </Button>
    ),
    size: 100,
    enableSorting: false,
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
    <Stack>
      <Title>Individuals</Title>

      <TableData<Individual>
        queryKey={["individuals"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "last_name", desc: false }}
      >
        <TableData.Search />
        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default IndividualsPage;

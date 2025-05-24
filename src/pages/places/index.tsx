import { fetchPlaces, PlaceWithType } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { PlaceSortField } from "@/types/sort";
import { capitalize } from "@/utils/strings";
import { Badge, Stack, Text } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

type TableState = {
  globalFilter: string;
  sorting: { id: string; desc: boolean } | null;
  pagination: { pageIndex: number; pageSize: number };
};

const columns: ColumnDef<PlaceWithType, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <Text fw={500}>{row.original.name}</Text>,
    size: 400,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="default">
        {capitalize(row.original.place_type?.name || "")}
      </Badge>
    ),
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => row.original.parent?.name || "None",
    size: 300,
    enableSorting: false,
  },
];

export const Route = createFileRoute("/places/")({
  component: PlacesPage,
});

function PlacesPage() {
  const navigate = useNavigate();

  const fetchTableData = async (state: TableState) => {
    const response = await fetchPlaces({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sortConfig: state.sorting
        ? {
            field: state.sorting.id as PlaceSortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : { field: "name", direction: "asc" },
    });

    return {
      data: response.data,
      totalCount: response.total ?? 0,
    };
  };

  const handleRowClick = (place: PlaceWithType) => {
    navigate({ to: `/places/${place.id}` });
  };

  return (
    <Stack>
      <PageHeader title="Places" />

      <TableData<PlaceWithType>
        queryKey={["places"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "name", desc: false }}
        onRowClick={handleRowClick}
      >
        {/* <TableData.Filters createPagePath="/places/new" /> */}
        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default PlacesPage;

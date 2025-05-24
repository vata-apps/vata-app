import { fetchFamilies } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { FamilySortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Stack } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";

type Family = Awaited<ReturnType<typeof fetchFamilies>>["data"][number];

type TableState = {
  globalFilter: string;
  sorting: { id: string; desc: boolean } | null;
  pagination: { pageIndex: number; pageSize: number };
};

const columns: ColumnDef<Family, unknown>[] = [
  {
    accessorKey: "husband",
    header: "Husband",
    cell: ({ row, table }) => {
      const husband = row.original.husband;
      if (!husband)
        return (
          <span
            style={{
              fontStyle: "italic",
              color: "var(--mantine-color-dimmed)",
            }}
          >
            Unknown
          </span>
        );

      const sorting = table.getState().sorting;
      const part = sorting?.[0]?.id?.includes("last_name")
        ? "fullInverted"
        : "full";
      return displayName(husband.names, { part });
    },
    id: "husband",
    size: 250,
  },
  {
    accessorKey: "wife",
    header: "Wife",
    cell: ({ row, table }) => {
      const wife = row.original.wife;
      if (!wife)
        return (
          <span
            style={{
              fontStyle: "italic",
              color: "var(--mantine-color-dimmed)",
            }}
          >
            Unknown
          </span>
        );

      const sorting = table.getState().sorting;
      const part = sorting?.[0]?.id?.includes("last_name")
        ? "fullInverted"
        : "full";
      return displayName(wife.names, { part });
    },
    id: "wife",
    size: 250,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => capitalize(row.original.type),
    id: "type",
    size: 150,
  },
  {
    accessorKey: "children",
    header: "Children",
    cell: ({ row, table }) => {
      const sorting = table.getState().sorting;
      const part = sorting?.[0]?.id?.includes("last_name")
        ? "fullInverted"
        : "full";

      const childrenNames = row.original.children.map((child) =>
        displayName(child.individual.names, { part }),
      );
      return (
        <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {childrenNames.join(" • ")}
        </span>
      );
    },
  },
];

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  const navigate = useNavigate();

  const fetchTableData = async (state: TableState) => {
    const response = await fetchFamilies({
      page: state.pagination.pageIndex + 1,
      query: state.globalFilter,
      sort: state.sorting
        ? {
            field: state.sorting.id as FamilySortField,
            direction: state.sorting.desc ? "desc" : "asc",
          }
        : null,
    });

    return {
      data: response.data,
      total: response.total ?? 0,
    };
  };

  const handleRowClick = (family: Family) => {
    navigate({ to: `/families/${family.id}` });
  };

  return (
    <Stack>
      <PageHeader title="Families" />

      <TableData<Family>
        queryKey={["families"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "husband_last_name", desc: false }}
        onRowClick={handleRowClick}
      >
        <TableData.Toolbar>
          <TableData.AddButton to="/families/new" />
          <TableData.Search placeholder="Search by member name" />
          <TableData.SortBy
            sortOptions={[
              {
                desc: false,
                id: "husband_first_name",
                label: "Husband First Name (A - Z)",
              },
              {
                desc: true,
                id: "husband_first_name",
                label: "Husband First Name (Z - A)",
              },
              {
                desc: false,
                id: "husband_last_name",
                label: "Husband Last Name (A - Z)",
              },
              {
                desc: true,
                id: "husband_last_name",
                label: "Husband Last Name (Z - A)",
              },
              {
                desc: false,
                id: "wife_first_name",
                label: "Wife First Name (A - Z)",
              },
              {
                desc: true,
                id: "wife_first_name",
                label: "Wife First Name (Z - A)",
              },
              {
                desc: false,
                id: "wife_last_name",
                label: "Wife Last Name (A - Z)",
              },
              {
                desc: true,
                id: "wife_last_name",
                label: "Wife Last Name (Z - A)",
              },
            ]}
          />
        </TableData.Toolbar>

        <TableData.Table />
      </TableData>
    </Stack>
  );
}

export default FamiliesPage;

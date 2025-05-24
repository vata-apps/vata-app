import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { FamilySortField } from "@/types/sort";
import { Button, Stack } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
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
    cell: ({ row }) => {
      const husband = row.original.husband;

      if (!husband) {
        return (
          <Button disabled size="compact-sm" variant="subtle">
            Add Husband
          </Button>
        );
      }

      return <FamilyMember individual={husband} />;
    },
    id: "husband",
  },
  {
    accessorKey: "wife",
    header: "Wife",
    cell: ({ row }) => {
      const wife = row.original.wife;

      if (!wife) {
        return (
          <Button disabled size="compact-sm" variant="subtle">
            Add Wife
          </Button>
        );
      }

      return <FamilyMember individual={wife} />;
    },
    id: "wife",
  },
  {
    accessorKey: "children",
    header: "Children",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {row.original.children.map((child) => (
          <FamilyMember
            key={child.individual.id}
            individual={child.individual}
          />
        ))}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button
          component={Link}
          size="xs"
          to={`/families/${row.original.id}`}
          variant="default"
        >
          View
        </Button>
      </div>
    ),
    size: 120,
    enableSorting: false,
  },
];

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
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
      data: response.data as Family[],
      totalCount: response.total ?? 0,
    };
  };

  return (
    <Stack>
      <PageHeader title="Families" />

      <TableData<Family>
        queryKey={["families"]}
        fetchData={fetchTableData}
        columns={columns}
        defaultSorting={{ id: "husband_last_name", desc: false }}
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

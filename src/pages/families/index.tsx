import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { PageHeader } from "@/components/PageHeader";
import { TableData } from "@/components/table-data";
import { FamilySortField } from "@/types/sort";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Group, Stack, Text } from "@mantine/core";
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const husband = row.original.husband;
      const wife = row.original.wife;

      return (
        <Text>
          {(() => {
            if (husband && !wife) {
              return `${displayName(husband.names)} • Unknown mother`;
            }

            if (!husband && wife) {
              return `Unknown father • ${displayName(wife.names)}`;
            }

            if (husband && wife) {
              return `${displayName(husband.names)} • ${displayName(wife.names)}`;
            }

            return "Unknown parents";
          })()}
        </Text>
      );
    },
    id: "name",
    size: 500,
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => capitalize(row.original.type),
    id: "type",
    size: 100,
  },

  {
    accessorKey: "children",
    header: "Children",
    cell: ({ row }) => (
      <Group align="center" gap="xs">
        {row.original.children.map((child) => (
          <FamilyMember
            key={child.individual.id}
            individual={child.individual}
          />
        ))}
      </Group>
    ),
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
      data: response.data as Family[],
      totalCount: response.total ?? 0,
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

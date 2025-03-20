import { fetchFamilies } from "@/api";
import { FamilyMember } from "@/components/individual/FamilyMember";
import { TableData } from "@/components/table-data";
import { H2 } from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
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
      return husband ? <FamilyMember individual={husband} /> : null;
    },
    size: 250,
  },
  {
    accessorKey: "wife",
    header: "Wife",
    cell: ({ row }) => {
      const wife = row.original.wife;
      return wife ? <FamilyMember individual={wife} /> : null;
    },
    size: 250,
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
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/families/$familyId" params={{ familyId: row.original.id }}>
            View
          </Link>
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
    });

    return {
      data: response.data as Family[],
      totalCount: response.total ?? 0,
    };
  };

  return (
    <div className="space-y-8">
      <H2>Families</H2>

      <TableData<Family>
        queryKey={["families"]}
        fetchData={fetchTableData}
        columns={columns}
      >
        <TableData.Search />
        <TableData.Table />
      </TableData>
    </div>
  );
}

export default FamiliesPage;

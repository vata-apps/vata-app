import { Select } from "@mantine/core";
import { TableSortOption } from "./types";
import { useTableData } from "./use-table-data";

interface SortByProps {
  sortOptions: (TableSortOption & { label: string })[];
}

export function SortBy({ sortOptions }: SortByProps) {
  const { table } = useTableData();

  return (
    <Select
      checkIconPosition="right"
      data={sortOptions.map((option) => ({
        value: `${option.id}-${option.desc ? "desc" : "asc"}`,
        label: option.label,
      }))}
      onChange={(value) => {
        console.log(value);
        if (!value) {
          table.setSorting([]);
          return;
        }

        const [id, desc] = value.split("-");
        table.setSorting([{ id, desc: desc === "desc" }]);
      }}
      ml="auto"
      value={`${table.getState().sorting?.[0]?.id}-${table.getState().sorting?.[0]?.desc ? "desc" : "asc"}`}
    />
  );
}

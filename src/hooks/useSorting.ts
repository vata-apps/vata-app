import { SortDirection } from "@/types/sort";
import { SortingState } from "@tanstack/react-table";
import { useState } from "react";

export interface SortConfig<TField extends string> {
  field: TField;
  direction: SortDirection;
}

interface UseSortingOptions<TField extends string> {
  defaultField?: TField;
  defaultDirection?: SortDirection;
}

export function useSorting<TField extends string>({
  defaultField,
  defaultDirection = "asc",
}: UseSortingOptions<TField> = {}) {
  const [sorting, setSorting] = useState<SortingState>(
    defaultField
      ? [{ id: defaultField, desc: defaultDirection === "desc" }]
      : [{ id: defaultField || "", desc: defaultDirection === "desc" }],
  );

  const sortConfig: SortConfig<TField> | null = sorting[0]
    ? {
        field: sorting[0].id as TField,
        direction: sorting[0].desc ? "desc" : "asc",
      }
    : null;

  const handleSortingChange = (updatedSorting: SortingState) => {
    // If we're trying to clear the sort (updatedSorting is empty),
    // keep the current field but toggle the direction
    if (updatedSorting.length === 0 && sorting.length > 0) {
      setSorting([
        {
          id: sorting[0].id,
          desc: !sorting[0].desc,
        },
      ]);
      return;
    }

    // For new sort field or normal toggle
    setSorting(updatedSorting);
  };

  return {
    sorting,
    sortConfig,
    onSortingChange: handleSortingChange,
  };
}

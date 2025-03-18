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
      : [],
  );

  const sortConfig: SortConfig<TField> | null = sorting[0]
    ? {
        field: sorting[0].id as TField,
        direction: sorting[0].desc ? "desc" : "asc",
      }
    : null;

  const handleSortingChange = (updatedSorting: SortingState) => {
    setSorting(updatedSorting);
  };

  return {
    sorting,
    sortConfig,
    onSortingChange: handleSortingChange,
  };
}

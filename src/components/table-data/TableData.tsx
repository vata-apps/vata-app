import { Alert, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { TableDataContext } from "./context";
import { TableDataContextType, TableDataProps } from "./types";

export function TableData<TData extends Record<string, unknown>>({
  queryKey,
  fetchData,
  columns,
  onRowClick,
  children,
}: TableDataProps<TData>) {
  const [tableState, setTableState] = useState<{ globalFilter: string }>({
    globalFilter: "",
  });

  const [debouncedFilter] = useDebounce(tableState.globalFilter, 300);

  // Reset page when debounced filter changes
  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      globalFilter: "",
    }));
  }, [debouncedFilter]);

  const {
    data: queryResponse,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: [...queryKey, { globalFilter: debouncedFilter }],
    queryFn: () => fetchData({ globalFilter: debouncedFilter }),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const table = useReactTable<TData>({
    data: queryResponse?.data ?? [],
    columns,

    manualFiltering: true,

    defaultColumn: {
      size: undefined,
    },

    state: {
      globalFilter: tableState.globalFilter,
    },

    onGlobalFilterChange: (value: string) => {
      setTableState((prev) => ({
        ...prev,
        globalFilter: value,
      }));
    },

    getCoreRowModel: getCoreRowModel(),
  });

  if (isError && error instanceof Error) {
    return (
      <Alert color="red" title="Something went wrong">
        <Text>{error.message}</Text>
      </Alert>
    );
  }

  return (
    <TableDataContext.Provider
      value={
        {
          table,
          isLoading,
          isError,
          error: error instanceof Error ? error : null,
          columns,
          onRowClick,
        } as TableDataContextType<TData>
      }
    >
      {children}
    </TableDataContext.Provider>
  );
}

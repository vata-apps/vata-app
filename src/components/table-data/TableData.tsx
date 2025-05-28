import { Alert, Text } from "@mantine/core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { TableDataContext } from "./context";
import {
  TableDataContextType,
  TableDataProps,
  TableMeta,
  TableState,
} from "./types";

export function TableData<TData extends Record<string, unknown>>({
  queryKey,
  fetchData,
  columns,
  defaultSorting,
  onRowClick,
  children,
  blankState,
}: TableDataProps<TData>) {
  const [tableState, setTableState] = useState<TableState>({
    sorting: defaultSorting || {
      id: columns[0].id || String(Object.keys(columns[0])[0]),
      desc: false,
    },
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    globalFilter: "",
  });

  const [debouncedFilter] = useDebounce(tableState.globalFilter, 300);

  // Reset page when debounced filter changes
  useEffect(() => {
    setTableState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  }, [debouncedFilter]);

  const {
    data: queryResponse,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: [...queryKey, { ...tableState, globalFilter: debouncedFilter }],
    queryFn: () => fetchData({ ...tableState, globalFilter: debouncedFilter }),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const table = useReactTable<TData>({
    data: queryResponse?.data ?? [],
    columns,
    pageCount: queryResponse ? Math.ceil(queryResponse.total / 10) : 0,
    meta: {
      total: queryResponse?.total ?? 0,
    } as TableMeta,

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    defaultColumn: {
      size: undefined,
    },

    state: {
      sorting: tableState.sorting ? [tableState.sorting] : [],
      pagination: tableState.pagination,
      globalFilter: tableState.globalFilter,
    },

    onSortingChange: ((updater) => {
      const sorting =
        typeof updater === "function"
          ? updater(tableState.sorting ? [tableState.sorting] : [])
          : updater;

      // If trying to clear sorting (by clicking a third time),
      // we keep the same column but toggle the direction
      const newSorting =
        sorting[0] ||
        (tableState.sorting && {
          ...tableState.sorting,
          desc: !tableState.sorting.desc,
        });

      setTableState((prev) => ({
        ...prev,
        sorting: newSorting,
        pagination: { ...prev.pagination, pageIndex: 0 },
      }));
    }) as OnChangeFn<SortingState>,

    onPaginationChange: ((updater) => {
      const pagination =
        typeof updater === "function"
          ? updater(tableState.pagination)
          : updater;
      setTableState((prev) => ({
        ...prev,
        pagination,
      }));
    }) as OnChangeFn<PaginationState>,

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
          blankState,
        } as TableDataContextType<TData>
      }
    >
      {children}
    </TableDataContext.Provider>
  );
}

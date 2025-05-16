import { ColumnDef, Table } from "@tanstack/react-table";

/**
 * Represents the meta object used in TanStack Table configuration
 */
export interface TableMeta {
  totalCount: number;
}

export interface TableState {
  sorting: {
    id: string;
    desc: boolean;
  } | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
}

export interface TableDataResponse<TData> {
  data: TData[];
  totalCount: number;
}

export interface TableDataProps<TData> {
  queryKey: string[];
  fetchData: (state: TableState) => Promise<TableDataResponse<TData>>;
  columns: ColumnDef<TData, unknown>[];
  defaultSorting?: { id: string; desc: boolean };
  children: React.ReactNode;
}

export interface TableDataContextType<TData> {
  table: Table<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  columns: ColumnDef<TData, unknown>[];
}

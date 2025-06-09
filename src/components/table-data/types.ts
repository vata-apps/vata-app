import { ColumnDef, Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

/**
 * Represents the meta object used in TanStack Table configuration
 */
export interface TableMeta {
  total: number;
}

export interface TableSortOption {
  column: string;
  desc: boolean;
}

export interface TableState {
  sorting: TableSortOption | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
}

export interface TableDataResponse<TData> {
  data: TData[];
  total: number;
}

export interface TableDataProps<TData> {
  queryKey: string[];
  fetchData: (state: {
    globalFilter: string;
  }) => Promise<TableDataResponse<TData>>;
  columns: ColumnDef<TData, unknown>[];
  onRowClick?: (row: TData) => void;
  children: React.ReactNode;
}

export interface TableDataContextType<TData> {
  table: Table<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  columns: ColumnDef<TData, unknown>[];
  onRowClick?: (row: TData) => void;
  showPagination?: boolean;
  blankState?: {
    icon: LucideIcon;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

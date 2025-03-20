import { useContext } from "react";
import { TableDataContext } from "./context";
import type { TableDataContextType } from "./types";

export function useTableData<TData>() {
  const context = useContext(TableDataContext);

  if (!context) {
    throw new Error("useTableData must be used within a TableDataProvider");
  }

  return context as TableDataContextType<TData>;
}

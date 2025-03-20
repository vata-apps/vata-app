import { Pagination } from "@/components/Pagination";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTableData } from "./use-table-data";

const COLUMNS_WITHOUT_PADDING = ["actions", "buttons"];

const hasNoPadding = (columnId: string) =>
  COLUMNS_WITHOUT_PADDING.includes(columnId);

const getHeaderContentClassName = (columnId: string) => {
  if (columnId === "actions") return "flex items-center justify-end";
  return "flex items-center gap-2";
};

const getCellContentClassName = (columnId: string) => {
  if (columnId === "actions") return "flex items-center justify-end gap-2 py-4";
  return "py-4";
};

export function Table<TData extends Record<string, unknown>>() {
  const { table, isLoading } = useTableData<TData>();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4">
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortHandler = header.column.getToggleSortingHandler();
                return (
                  <TableHead
                    key={header.id}
                    onClick={sortHandler}
                    className={[
                      hasNoPadding(header.column.id) ? "p-0" : "",
                      header.column.id === "actions" ? "text-right" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                      width: header.column.columnDef.size
                        ? header.column.getSize()
                        : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={getHeaderContentClassName(header.column.id)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() && (
                          <div className="text-muted-foreground">
                            {header.column.getIsSorted() === "asc" && (
                              <ChevronUp className="h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    width: cell.column.columnDef.size
                      ? cell.column.getSize()
                      : undefined,
                  }}
                >
                  <div className={getCellContentClassName(cell.column.id)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </UITable>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => table.setPageIndex(page - 1)}
        />
      </div>
    </div>
  );
}

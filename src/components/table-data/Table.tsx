import {
  Group,
  Loader,
  Table as MantineTable,
  Pagination,
  Text,
} from "@mantine/core";
import { flexRender } from "@tanstack/react-table";
import { TableMeta } from "./types";
import { useTableData } from "./useTableData";

const { Thead, Tr, Th, Tbody, Td } = MantineTable;

export function Table<TData extends Record<string, unknown>>() {
  const { table, isLoading, onRowClick } = useTableData<TData>();

  if (isLoading) {
    return <Loader />;
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <>
      <MantineTable
        verticalSpacing="sm"
        style={{ tableLayout: "fixed" }}
        highlightOnHover={true}
      >
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th
                    key={header.id}
                    style={(() => {
                      if (!header.column.columnDef.size) return undefined;
                      return { width: `${header.column.getSize()}px` };
                    })()}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              style={{
                cursor: onRowClick ? "pointer" : undefined,
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const width = (() => {
                  if (!cell.column.columnDef.size) return undefined;
                  return `${cell.column.getSize()}px`;
                })();

                return (
                  <Td
                    key={cell.id}
                    valign="top"
                    style={{
                      width,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Group gap="xs" style={{ minWidth: 0 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </Group>
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </MantineTable>

      <Group justify="space-between">
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={(page) => table.setPageIndex(page - 1)}
        />

        <Text>
          {(table.options.meta as TableMeta)?.total ?? 0}{" "}
          {(table.options.meta as TableMeta)?.total === 1 ? "row" : "rows"}{" "}
          found
        </Text>
      </Group>
    </>
  );
}

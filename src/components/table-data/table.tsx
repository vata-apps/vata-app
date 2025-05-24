import {
  AppShell,
  Group,
  Loader,
  Table as MantineTable,
  Pagination,
  Text,
} from "@mantine/core";
import { flexRender } from "@tanstack/react-table";
import { TableMeta } from "./types";
import { useTableData } from "./use-table-data";

const { Thead, Tr, Th, Tbody, Td } = MantineTable;

export function Table<TData extends Record<string, unknown>>() {
  const { table, isLoading } = useTableData<TData>();

  if (isLoading) {
    return <Loader />;
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <>
      <MantineTable verticalSpacing="sm" style={{ tableLayout: "fixed" }}>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const width = (() => {
                  if (!header.column.columnDef.size) return undefined;
                  return `${header.column.getSize()}px`;
                })();

                return (
                  <Th
                    key={header.id}
                    style={{
                      width,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    ta="left"
                  >
                    {!header.isPlaceholder && (
                      <Group gap="xs" align="center" style={{ minWidth: 0 }}>
                        <Text truncate="end" style={{ flex: 1 }}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </Text>
                      </Group>
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>

        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const width = (() => {
                  if (!cell.column.columnDef.size) return undefined;
                  return `${cell.column.getSize()}px`;
                })();

                return (
                  <Td
                    key={cell.id}
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

      <AppShell.Footer
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          borderLeft: "1px solid var(--app-shell-border-color)",
          left: "calc(var(--app-shell-navbar-offset) - 1px)",
          padding: "var(--app-shell-padding)",
        }}
      >
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={(page) => table.setPageIndex(page - 1)}
        />

        <Text>
          {(table.options.meta as TableMeta)?.totalCount ?? 0}{" "}
          {(table.options.meta as TableMeta)?.totalCount === 1 ? "row" : "rows"}{" "}
          found
        </Text>
      </AppShell.Footer>
    </>
  );
}

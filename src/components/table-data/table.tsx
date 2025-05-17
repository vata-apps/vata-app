import {
  AppShell,
  Group,
  Table as MantineTable,
  Pagination,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableMeta } from "./types";
import { useTableData } from "./use-table-data";

const { Thead, Tr, Th, Tbody, Td } = MantineTable;

export function Table<TData extends Record<string, unknown>>() {
  const { table, isLoading } = useTableData<TData>();
  const mantine = useMantineTheme();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <>
      <MantineTable>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortHandler = header.column.getToggleSortingHandler();

                const width = (() => {
                  if (!header.column.columnDef.size) return undefined;
                  return header.column.getSize();
                })();

                const cursor = (() => {
                  if (!header.column.getCanSort()) return "default";
                  return "pointer";
                })();

                return (
                  <Th
                    key={header.id}
                    onClick={sortHandler}
                    style={{ cursor, width }}
                    ta={header.column.id === "actions" ? "right" : "left"}
                  >
                    {!header.isPlaceholder && (
                      <Group gap="xs" align="center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() && (
                          <>
                            {header.column.getIsSorted() === "asc" && (
                              <ChevronUp
                                color={mantine.colors.gray[4]}
                                size={16}
                              />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ChevronDown
                                color={mantine.colors.gray[4]}
                                size={16}
                              />
                            )}
                          </>
                        )}
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
                return (
                  <Td key={cell.id}>
                    <Group
                      gap="xs"
                      justify={
                        cell.column.id === "actions" ? "flex-end" : "flex-start"
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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

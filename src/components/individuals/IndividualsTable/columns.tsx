import { GenderIcon } from "@/components/GenderIcon";
import { TableData } from "@/components/table-data";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { Group, Stack } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import type { Individual, IndividualColumnId } from "./types";

const nameColumn: ColumnDef<Individual, unknown> = {
  accessorKey: "names",
  header: "Name",
  cell: ({ row, table }) => {
    const sorting = table.getState().sorting;
    const part = sorting?.[0]?.id === "last_name" ? "fullInverted" : "full";
    return displayName(row.original.names, { part });
  },
  id: "name",
};

const genderColumn: ColumnDef<Individual, unknown> = {
  accessorKey: "gender",
  header: "Gender",
  cell: ({ row }) => (
    <Group gap="sm">
      <GenderIcon size={16} gender={row.original.gender} />
      {capitalize(row.original.gender)}
    </Group>
  ),
  size: 128,
};

const birthColumn: ColumnDef<Individual, unknown> = {
  accessorKey: "birth",
  header: "Birth",
  cell: ({ row }) => {
    const birthEvent = row.original.individual_events.find(
      (event) => event.individual_event_types.name === "birth",
    );
    if (!birthEvent) return null;
    return (
      <Stack gap={0}>
        <TableData.Text>{birthEvent.date}</TableData.Text>
        {birthEvent.places && birthEvent.places.name ? (
          <TableData.Text c="dimmed">{birthEvent.places.name}</TableData.Text>
        ) : (
          <TableData.Text c="dimmed" fs="italic">
            Unknown location
          </TableData.Text>
        )}
      </Stack>
    );
  },
};

const deathColumn: ColumnDef<Individual, unknown> = {
  accessorKey: "death",
  header: "Death",
  cell: ({ row }) => {
    const deathEvent = row.original.individual_events.find(
      (event) => event.individual_event_types.name === "death",
    );
    if (!deathEvent) return null;
    return (
      <Stack gap={0}>
        <TableData.Text>{deathEvent.date}</TableData.Text>
        {deathEvent.places && deathEvent.places.name ? (
          <TableData.Text c="dimmed">{deathEvent.places.name}</TableData.Text>
        ) : (
          <TableData.Text c="dimmed" fs="italic">
            Unknown location
          </TableData.Text>
        )}
      </Stack>
    );
  },
};

/**
 * Get visible columns based on hideColumns prop
 */
export function getVisibleColumns(
  hideColumns?: IndividualColumnId[],
): ColumnDef<Individual, unknown>[] {
  const allColumns = {
    name: nameColumn,
    gender: genderColumn,
    birth: birthColumn,
    death: deathColumn,
  };

  return Object.entries(allColumns)
    .filter(([key]) => !hideColumns?.includes(key as IndividualColumnId))
    .map(([, column]) => column);
}

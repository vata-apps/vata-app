import { GenderIcon } from "@/components/GenderIcon";
import { TableData } from "@/components/table-data";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";
import { ActionIcon, Badge, Group, Stack } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import type { ColumnsConfig, Individual, IndividualColumnId } from "./types";

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

const roleColumn: ColumnDef<Individual, unknown> = {
  accessorKey: "role_name",
  header: "Role",
  cell: ({ row }) => {
    if (!row.original.role_name) return null;
    return (
      <Badge variant="light" size="sm" color="blue">
        {row.original.role_name}
      </Badge>
    );
  },
  size: 120,
};

/**
 * Create actions column with delete button
 */
const createActionsColumn = (
  onDeleteIndividual: (individualId: string) => void,
): ColumnDef<Individual, unknown> => ({
  id: "actions",
  header: "",
  cell: ({ row }) => {
    const handleDeleteClick = (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent row click when clicking delete button
      onDeleteIndividual(row.original.id);
    };

    return (
      <Group gap="xs" justify="flex-end">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleDeleteClick}
          aria-label="Delete individual"
        >
          <X size={16} />
        </ActionIcon>
      </Group>
    );
  },
  size: 60,
  enableSorting: false,
});

/**
 * Apply column configuration to a column definition
 */
function applyColumnConfig(
  column: ColumnDef<Individual, unknown>,
  config?: { visible?: boolean; width?: number },
): ColumnDef<Individual, unknown> | null {
  if (config?.visible === false) {
    return null;
  }

  if (config?.width) {
    return {
      ...column,
      size: config.width,
    };
  }

  return column;
}

/**
 * Get visible columns based on hideColumns, showColumns, and columnsConfig props
 * Ensures role column always appears right after name when both are present
 */
export function getVisibleColumns(
  hideColumns?: IndividualColumnId[],
  showColumns?: IndividualColumnId[],
  columnsConfig?: ColumnsConfig,
  onDeleteIndividual?: (individualId: string) => void,
): ColumnDef<Individual, unknown>[] {
  const baseColumns = {
    name: nameColumn,
    gender: genderColumn,
    birth: birthColumn,
    death: deathColumn,
    role: roleColumn,
  };

  // Apply column configuration (width, visibility, etc.)
  const allColumns = {
    name: applyColumnConfig(baseColumns.name, columnsConfig?.name),
    gender: applyColumnConfig(baseColumns.gender, columnsConfig?.gender),
    birth: applyColumnConfig(baseColumns.birth, columnsConfig?.birth),
    death: applyColumnConfig(baseColumns.death, columnsConfig?.death),
    role: applyColumnConfig(baseColumns.role, columnsConfig?.role),
  };

  let visibleColumns: ColumnDef<Individual, unknown>[] = [];

  // If showColumns is specified, use that order but ensure role comes after name
  if (showColumns) {
    const hasName = showColumns.includes("name") && allColumns.name !== null;
    const hasRole = showColumns.includes("role") && allColumns.role !== null;

    // Always add name first if present
    if (hasName && allColumns.name) {
      visibleColumns.push(allColumns.name);
    }

    // Add role right after name if both are present
    if (hasRole && hasName && allColumns.role) {
      visibleColumns.push(allColumns.role);
    }

    // Add remaining columns in the specified order (excluding name and role)
    showColumns
      .filter((columnId) => columnId !== "name" && columnId !== "role")
      .forEach((columnId) => {
        const column = allColumns[columnId];
        if (column !== null) {
          visibleColumns.push(column);
        }
      });

    // Add role at the end if name is not present but role is
    if (hasRole && !hasName && allColumns.role) {
      visibleColumns.push(allColumns.role);
    }
  } else {
    // Default behavior: show all columns except those in hideColumns
    // Ensure role comes after name in the default order
    const defaultOrder: IndividualColumnId[] = [
      "name",
      "role",
      "gender",
      "birth",
      "death",
    ];

    visibleColumns = defaultOrder
      .filter((columnId) => !hideColumns?.includes(columnId))
      .map((columnId) => allColumns[columnId])
      .filter(
        (column): column is ColumnDef<Individual, unknown> => column !== null,
      );
  }

  // Add actions column if onDeleteIndividual is provided
  if (onDeleteIndividual) {
    visibleColumns.push(createActionsColumn(onDeleteIndividual));
  }

  return visibleColumns;
}

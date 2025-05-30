import { formatDate } from "@/utils/dates";
import { capitalize } from "@/utils/strings";
import { ActionIcon, Group } from "@mantine/core";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import type { ColumnsConfig, Event, EventColumnId } from "./types";

const typeColumn: ColumnDef<Event, unknown> = {
  accessorKey: "event_type_name",
  header: "Type",
  cell: ({ row }) => {
    const type = row.original.event_type_name;
    return type ? capitalize(type) : "Unknown";
  },
  size: 150,
};

const dateColumn: ColumnDef<Event, unknown> = {
  accessorKey: "date",
  header: "Date",
  cell: ({ row }) => formatDate(row.original.date),
  size: 180,
};

const subjectsColumn: ColumnDef<Event, unknown> = {
  accessorKey: "subjects",
  header: "Subject(s)",
  cell: ({ row }) => {
    const subjects = row.original.subjects;
    return subjects ? subjects.replace(/,/g, " •") : "Unknown";
  },
  size: 300,
};

const placeColumn: ColumnDef<Event, unknown> = {
  accessorKey: "place_name",
  header: "Place",
  cell: ({ row }) => row.original.place_name || "Unknown",
};

/**
 * Create actions column with delete button
 */
const createActionsColumn = (
  onDeleteEvent: (eventId: string) => void,
): ColumnDef<Event, unknown> => ({
  id: "actions",
  header: "",
  cell: ({ row }) => {
    const handleDeleteClick = (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent row click when clicking delete button
      onDeleteEvent(row.original.id);
    };

    return (
      <Group gap="xs" justify="flex-end">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={handleDeleteClick}
          aria-label="Delete event"
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
  column: ColumnDef<Event, unknown>,
  config?: { visible?: boolean; width?: number },
): ColumnDef<Event, unknown> | null {
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
 */
export function getVisibleColumns(
  hideColumns?: EventColumnId[],
  showColumns?: EventColumnId[],
  columnsConfig?: ColumnsConfig,
  onDeleteEvent?: (eventId: string) => void,
): ColumnDef<Event, unknown>[] {
  const baseColumns = {
    type: typeColumn,
    date: dateColumn,
    subjects: subjectsColumn,
    place: placeColumn,
  };

  // Apply column configuration (width, visibility, etc.)
  const allColumns = {
    type: applyColumnConfig(baseColumns.type, columnsConfig?.type),
    date: applyColumnConfig(baseColumns.date, columnsConfig?.date),
    subjects: applyColumnConfig(baseColumns.subjects, columnsConfig?.subjects),
    place: applyColumnConfig(baseColumns.place, columnsConfig?.place),
  };

  let visibleColumns: ColumnDef<Event, unknown>[] = [];

  // If showColumns is specified, use that order
  if (showColumns) {
    visibleColumns = showColumns
      .map((columnId) => allColumns[columnId])
      .filter((column): column is ColumnDef<Event, unknown> => column !== null);
  } else {
    // Default behavior: show all columns except those in hideColumns
    const defaultOrder: EventColumnId[] = ["type", "date", "subjects", "place"];

    visibleColumns = defaultOrder
      .filter((columnId) => !hideColumns?.includes(columnId))
      .map((columnId) => allColumns[columnId])
      .filter((column): column is ColumnDef<Event, unknown> => column !== null);
  }

  // Add actions column if onDeleteEvent is provided
  if (onDeleteEvent) {
    visibleColumns.push(createActionsColumn(onDeleteEvent));
  }

  return visibleColumns;
}

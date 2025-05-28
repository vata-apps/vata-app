import { TableData } from "@/components/table-data";
import type { TableState } from "@/components/table-data/types";
import type { EventListItem } from "@/types/event";
import { formatDate } from "@/utils/dates";
import { capitalize } from "@/utils/strings";
import { ActionIcon, Group } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

interface EventsTableProps {
  /**
   * Function to fetch events data
   */
  fetchData: (state: TableState) => Promise<{
    data: EventListItem[];
    total: number;
  }>;
  /**
   * Query key for React Query caching
   */
  queryKey: string[];
  /**
   * Whether to show the place column
   */
  showPlaceColumn?: boolean;
  /**
   * Whether to show the toolbar with search and sort options
   */
  showToolbar?: boolean;
  /**
   * Whether to show the add button in the toolbar
   */
  showAddButton?: boolean;
  /**
   * Default sorting configuration
   */
  defaultSorting?: { id: string; desc: boolean };
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  /**
   * Callback function called when delete button is clicked
   */
  onDeleteEvent?: (eventId: string) => void;
  /**
   * Blank state configuration
   */
  blankState?: {
    icon: LucideIcon;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

export function EventsTable({
  fetchData,
  queryKey,
  showPlaceColumn = true,
  showToolbar = true,
  showAddButton = true,
  defaultSorting = { id: "date", desc: false },
  searchPlaceholder = "Search events",
  onDeleteEvent,
  blankState,
}: EventsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (event: EventListItem) => {
    navigate({
      to: `/events/${event.id}`,
    });
  };

  const handleDeleteClick = (event: React.MouseEvent, eventId: string) => {
    event.stopPropagation(); // Prevent row click when clicking delete button
    onDeleteEvent?.(eventId);
  };

  // Create actions column if onDeleteEvent is provided
  const actionsColumn: ColumnDef<EventListItem, unknown> = {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Group gap="xs" justify="flex-end">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={(e) => handleDeleteClick(e, row.original.id)}
          aria-label="Delete event"
        >
          <X size={16} />
        </ActionIcon>
      </Group>
    ),
    size: 60,
    enableSorting: false,
  };

  // Base columns without actions
  const baseColumns: ColumnDef<EventListItem, unknown>[] = [
    {
      accessorKey: "event_type_name",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.event_type_name;
        return type ? capitalize(type) : "Unknown";
      },
      size: 150,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
      size: 180,
    },
    {
      accessorKey: "subjects",
      header: "Subject(s)",
      cell: ({ row }) => {
        const subjects = row.original.subjects;
        return subjects ? subjects.replace(/,/g, " •") : "Unknown";
      },
      size: 300,
    },
  ];

  // Add place column if needed
  const columnsWithPlace: ColumnDef<EventListItem, unknown>[] = [
    ...baseColumns,
    {
      accessorKey: "place_name",
      header: "Place",
      cell: ({ row }) => row.original.place_name || "Unknown",
    },
  ];

  // Build final columns array
  const finalColumns = showPlaceColumn ? columnsWithPlace : baseColumns;

  // Add actions column if onDeleteEvent is provided
  const tableColumns = onDeleteEvent
    ? [...finalColumns, actionsColumn]
    : finalColumns;

  const sortOptions = [
    { desc: false, id: "date", label: "Date (Oldest First)" },
    { desc: true, id: "date", label: "Date (Newest First)" },
    { desc: false, id: "event_type_name", label: "Type (A-Z)" },
    { desc: true, id: "event_type_name", label: "Type (Z-A)" },
    ...(showPlaceColumn
      ? [
          { desc: false, id: "place_name", label: "Place (A-Z)" },
          { desc: true, id: "place_name", label: "Place (Z-A)" },
        ]
      : []),
  ];

  return (
    <TableData<EventListItem>
      queryKey={queryKey}
      fetchData={fetchData}
      columns={tableColumns}
      defaultSorting={defaultSorting}
      onRowClick={handleRowClick}
      blankState={blankState}
    >
      {showToolbar && (
        <TableData.Toolbar>
          {showAddButton && <TableData.AddButton to="/events/new" />}
          <TableData.Search placeholder={searchPlaceholder} />
          <TableData.SortBy sortOptions={sortOptions} />
        </TableData.Toolbar>
      )}

      <TableData.Table />
    </TableData>
  );
}

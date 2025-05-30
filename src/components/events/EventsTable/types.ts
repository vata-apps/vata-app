import type { EventListItem } from "@/types/event";
import type { LucideIcon } from "lucide-react";

export type Event = EventListItem;

export type EventColumnId = "type" | "date" | "subjects" | "place";

export interface ColumnConfig {
  visible?: boolean;
  width?: number;
}

export interface ColumnsConfig {
  type?: ColumnConfig;
  date?: ColumnConfig;
  subjects?: ColumnConfig;
  place?: ColumnConfig;
}

export interface EventFilters {
  placeId?: string;
  familyId?: string;
}

export interface AddButtonConfig {
  path?: string;
  variant?: "primary" | "secondary";
}

export interface BlankStateConfig {
  icon: LucideIcon;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface SortingConfig {
  id: string;
  desc: boolean;
}

export interface EventsTableProps {
  // Data Filtering (what to fetch)
  filters?: EventFilters;

  // Toolbar Configuration
  showToolbar?: boolean;
  showAddButton?: boolean;
  addButton?: AddButtonConfig;
  showSearch?: boolean;
  showSort?: boolean;
  searchPlaceholder?: string;

  // Column Configuration
  hideColumns?: EventColumnId[];
  showColumns?: EventColumnId[]; // Explicitly show only these columns
  columnsConfig?: ColumnsConfig; // Fine-grained column configuration

  // Behavior
  defaultSorting?: SortingConfig;
  onRowClick?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  blankState?: BlankStateConfig;
  showPagination?: boolean;
}

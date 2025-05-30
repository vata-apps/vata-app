import type { IndividualFilters } from "@/api/individuals/types";
import type { IndividualWithNames } from "@/types";
import type { LucideIcon } from "lucide-react";

export type IndividualEvent = {
  id: string;
  date: string | null;
  type_id: string;
  place_id: string | null;
  places: {
    id: string;
    name: string;
  } | null;
  individual_event_types: {
    id: string;
    name: string;
  };
};

export type Individual = IndividualWithNames & {
  individual_events: IndividualEvent[];
};

export type IndividualColumnId = "name" | "gender" | "birth" | "death";

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

export interface IndividualsTableProps {
  // Data Filtering (what to fetch)
  filters?: IndividualFilters;

  // Toolbar Configuration
  showToolbar?: boolean;
  showAddButton?: boolean;
  addButton?: AddButtonConfig;
  showSearch?: boolean;
  showSort?: boolean;
  searchPlaceholder?: string;

  // Column Configuration
  hideColumns?: IndividualColumnId[];

  // Behavior
  defaultSorting?: SortingConfig;
  onRowClick?: (individual: Individual) => void;
  blankState?: BlankStateConfig;
}

import type { EventColumnId } from "./types";

/**
 * Generates sort options based on visible columns
 */
export function getSortOptions(hideColumns?: EventColumnId[]) {
  const options = [];

  if (!hideColumns?.includes("date")) {
    options.push(
      { desc: false, id: "date", label: "Date (Oldest First)" },
      { desc: true, id: "date", label: "Date (Newest First)" },
    );
  }

  if (!hideColumns?.includes("type")) {
    options.push(
      { desc: false, id: "event_type_name", label: "Type (A-Z)" },
      { desc: true, id: "event_type_name", label: "Type (Z-A)" },
    );
  }

  if (!hideColumns?.includes("place")) {
    options.push(
      { desc: false, id: "place_name", label: "Place (A-Z)" },
      { desc: true, id: "place_name", label: "Place (Z-A)" },
    );
  }

  return options;
}

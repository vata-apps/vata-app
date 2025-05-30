import type { IndividualColumnId } from "./types";

/**
 * Generates sort options based on visible columns
 */
export function getSortOptions(hideColumns?: IndividualColumnId[]) {
  const options = [];

  if (!hideColumns?.includes("name")) {
    options.push(
      { desc: false, id: "first_name", label: "First Name (A - Z)" },
      { desc: true, id: "first_name", label: "First Name (Z - A)" },
      { desc: false, id: "last_name", label: "Last Name (A - Z)" },
      { desc: true, id: "last_name", label: "Last Name (Z - A)" },
    );
  }

  return options;
}

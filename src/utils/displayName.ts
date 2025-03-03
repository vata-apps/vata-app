import { Tables } from "@/database.types";

/**
 * Generates a display name from either a single name record or an array of name records
 * @param names Single name record or array of name records from the names table
 * @param options Configuration options
 * @param options.part Specifies which part of the name to return: "first" for first name only, "last" for last name only, or "full" (default) for full name
 * @returns For array input: The specified part of the primary record's name (or first record if no primary exists)
 *          For single record: The specified part of the record's name
 *          Returns trimmed full name by default, or just first/last name if specified in options
 */
export default function displayName(
  names: Partial<Tables<"names">>[] | Partial<Tables<"names">>,
  options?: {
    part?: "first" | "last" | "full";
  },
) {
  if (Array.isArray(names)) {
    const primaryName = names.find((name) => name.is_primary);
    if (!primaryName) return `${names[0].first_name} ${names[0].last_name}`;

    if (options?.part === "first") return primaryName.first_name;
    if (options?.part === "last") return primaryName.last_name;
    return `${primaryName.first_name} ${primaryName.last_name}`.trim();
  }

  if (options?.part === "first") return names.first_name;
  if (options?.part === "last") return names.last_name;
  return `${names.first_name} ${names.last_name}`.trim();
}

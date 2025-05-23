import { Tables } from "@/database.types";

/**
 * Generates a display name from either a single name record or an array of name records
 * @param names Single name record or array of name records from the names table
 * @param options Configuration options
 * @param options.part Specifies which part of the name to return: "first" for first name only, "last" for last name only, "fullInverted" for last name first, or "full" (default) for full name
 * @returns For array input: The specified part of the primary record's name (or first record if no primary exists)
 *          For single record: The specified part of the record's name
 *          Returns trimmed full name by default, or just first/last name if specified in options
 */
export default function displayName(
  names:
    | Partial<Tables<"names">>[]
    | Partial<Tables<"names">>
    | null
    | undefined,
  options?: {
    part?: "first" | "last" | "fullInverted" | "full";
  },
) {
  // Handle null/undefined names
  if (!names) return "";

  if (Array.isArray(names)) {
    // Handle empty array
    if (names.length === 0) return "";

    const primaryName = names.find((name) => name.is_primary);
    const namesToUse = primaryName || names[0] || {};

    if (options?.part === "first") return namesToUse.first_name || "";
    if (options?.part === "last") return namesToUse.last_name || "";
    if (options?.part === "fullInverted") {
      return `${namesToUse.last_name || ""}, ${namesToUse.first_name || ""}`.trim();
    }
    return `${namesToUse.first_name || ""} ${namesToUse.last_name || ""}`.trim();
  }

  if (options?.part === "first") return names.first_name || "";
  if (options?.part === "last") return names.last_name || "";
  if (options?.part === "fullInverted") {
    return `${names.last_name || ""}, ${names.first_name || ""}`.trim();
  }
  return `${names.first_name || ""} ${names.last_name || ""}`.trim();
}

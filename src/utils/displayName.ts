type Name = {
  firstName: string | null;
  lastName: string | null;
  isPrimary?: boolean;
};

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
  names: Name | Name[] | null | undefined,
  options?: {
    part?: "first" | "last" | "fullInverted" | "full";
  },
) {
  // Handle null/undefined names
  if (!names) return "";

  if (Array.isArray(names)) {
    // Handle empty array
    if (names.length === 0) return "";

    const primaryName = names.find((name) => name.isPrimary);
    const namesToUse = primaryName || names[0] || {};

    if (options?.part === "first") return namesToUse.firstName ?? "";
    if (options?.part === "last") return namesToUse.lastName ?? "";
    if (options?.part === "fullInverted") {
      return `${namesToUse.lastName ?? ""}, ${namesToUse.firstName ?? ""}`.trim();
    }
    return `${namesToUse.firstName ?? ""} ${namesToUse.lastName ?? ""}`.trim();
  }

  if (options?.part === "first") return names.firstName ?? "";
  if (options?.part === "last") return names.lastName ?? "";
  if (options?.part === "fullInverted") {
    return `${names.lastName ?? ""}, ${names.firstName ?? ""}`.trim();
  }
  return `${names.firstName ?? ""} ${names.lastName ?? ""}`.trim();
}

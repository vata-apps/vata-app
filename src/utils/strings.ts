/**
 * Capitalizes a string
 * @param str The string to capitalize
 * @param options Configuration options
 * @param options.firstWordOnly Whether to capitalize only the first word (default: false)
 * @returns The capitalized string
 */
export function capitalize(str: string, options?: { firstWordOnly?: boolean }) {
  if (!str) return "";

  if (options?.firstWordOnly) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

import { format, parseISO } from "date-fns";

/**
 * Formats a date string for display
 * @param dateString The date string to format
 * @param formatString The format string to use (default: 'MMMM d, yyyy')
 * @returns The formatted date string or a default message if no date
 */
export function formatDate(
  dateString: string | null,
  formatString = "MMMM d, yyyy",
) {
  if (!dateString) return "No date";
  try {
    return format(parseISO(dateString), formatString);
  } catch (error: unknown) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

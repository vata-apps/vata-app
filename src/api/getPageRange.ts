/**
 * Number of items to display per page
 */
const ITEMS_PER_PAGE = 10;
/**
 * Calculates the start and end indices for pagination
 * @param page - The page number (1-based)
 * @returns Object containing start and end indices for the requested page
 * @example
 * // Returns { start: 0, end: 10 } for page 1
 * getPageRange(1)
 * @private
 */
export function getPageRange(page: number) {
  return {
    start: (page - 1) * ITEMS_PER_PAGE,
    end: page * ITEMS_PER_PAGE - 1,
  };
}

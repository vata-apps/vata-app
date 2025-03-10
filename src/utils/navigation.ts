/**
 * Creates pagination parameters with validation
 * @param page The current page number
 * @param totalPages The total number of pages
 * @returns An object with pagination details and navigation functions
 */
export function usePagination(page: number, totalPages: number) {
  // Ensure page is within bounds
  const currentPage = Math.max(1, Math.min(page, Math.max(1, totalPages)));

  return {
    currentPage,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    firstPage: () => 1,
    previousPage: () => Math.max(1, currentPage - 1),
    nextPage: () => Math.min(totalPages, currentPage + 1),
    lastPage: () => totalPages,
  };
}

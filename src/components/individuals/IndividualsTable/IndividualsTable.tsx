import { TableData } from "@/components/table-data";
import { useNavigate } from "@tanstack/react-router";
import { getVisibleColumns } from "./columns";
import {
  DEFAULT_ADD_BUTTON_PATH,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SORTING,
} from "./constants";
import { createFetchTableData } from "./dataFetching";
import { getSortOptions } from "./sortOptions";
import type { Individual, IndividualsTableProps } from "./types";
import { generateQueryKey } from "./utils";

export function IndividualsTable({
  filters,
  showToolbar = true,
  showAddButton = true,
  addButton,
  showSearch = true,
  showSort = true,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  hideColumns,
  defaultSorting = DEFAULT_SORTING,
  onRowClick,
  blankState,
}: IndividualsTableProps) {
  const navigate = useNavigate();

  // Get configuration values
  const finalAddButtonPath = addButton?.path ?? DEFAULT_ADD_BUTTON_PATH;
  const columns = getVisibleColumns(hideColumns);
  const queryKey = generateQueryKey(filters);
  const sortOptions = getSortOptions(hideColumns);

  // Create handlers
  const fetchTableData = createFetchTableData(filters);

  const handleRowClick = (individual: Individual) => {
    if (onRowClick) {
      onRowClick(individual);
    } else {
      navigate({ to: `/individuals/${individual.id}` });
    }
  };

  return (
    <TableData
      queryKey={queryKey}
      fetchData={fetchTableData}
      columns={columns}
      defaultSorting={defaultSorting}
      onRowClick={handleRowClick}
      blankState={blankState}
    >
      {showToolbar && (
        <TableData.Toolbar>
          {showAddButton && <TableData.AddButton to={finalAddButtonPath} />}
          {showSearch && <TableData.Search placeholder={searchPlaceholder} />}
          {showSort && <TableData.SortBy sortOptions={sortOptions} />}
        </TableData.Toolbar>
      )}

      <TableData.Table />
    </TableData>
  );
}

/**
 * Table primitive — a semantic, sortable, activatable table.
 *
 * Owns table mechanics only: native table semantics, sticky header, sort
 * indicators, and whole-row activation that follows the row's primary link.
 * It has no knowledge of loading, error, or empty messages; that lives in the
 * application {@link EntityTable}.
 *
 * Row activation is derived from the primary cell's real `<a>` link. A click
 * anywhere on the row follows that same link, unless it lands on an
 * interactive element or is part of a text selection. Keyboard users tab to
 * the link and press Enter; pointer users can ⌘-click the row because the
 * synthetic click preserves modifiers.
 */
import { type ReactNode, useMemo, useState } from 'react';

import { Icon } from '$components/icon';

import * as styles from './table.css';

/** A single column of a {@link Table}. */
export interface TableColumn<T> {
  /** Stable key for the column (used as the React key). */
  key: string;
  /** Translated, user-facing column header. */
  header: string;
  /**
   * Accessible name for the column header when {@link header} is visually
   * empty (e.g. an icon-only column). Columns with visible text are named by
   * that text and do not need this.
   */
  headerLabel?: string;
  /** Renders the cell content for one row. */
  cell: (item: T) => ReactNode;
  /**
   * When true, the column is rendered as the row header cell (`<th scope="row">`).
   * Exactly one column should set this; it is expected to contain the row's
   * primary link.
   */
  rowHeader?: boolean;
  /** Optional fixed column width (a CSS dimension string, e.g. `"120px"`). */
  width?: string;
  /**
   * When set, the column becomes sortable. Return `null` for items with no
   * value so they sort last in either direction.
   */
  sortValue?: (item: T) => string | number | null;
}

/** The active sort: which column, and which direction. */
export interface TableSort {
  /** `key` of the sorted column. */
  columnKey: string;
  direction: 'asc' | 'desc';
}

/** Props accepted by {@link Table}. */
export interface TableProps<T> {
  /** Accessible label for the table element. */
  label: string;
  /** Column definitions, in display order. */
  columns: TableColumn<T>[];
  /** The rows to render. */
  rows: T[];
  /** Stable React key for a row. */
  getRowKey: (item: T) => string;
  /**
   * Initial sort. The column must declare a `sortValue`. When omitted, rows
   * render in the order given and no header shows a sort indicator until the
   * user clicks one. Sorting is managed internally from here on.
   */
  defaultSort?: TableSort;
  /**
   * Optional content to render inside `<tbody>` instead of the mapped rows.
   * Used by {@link EntityTable} for skeleton, empty, and error states while
   * keeping this primitive free of message semantics.
   */
  bodyContent?: ReactNode;
}

/** The `aria-sort` value for a header cell: `undefined` for unsortable columns. */
function ariaSort<T>(
  column: TableColumn<T>,
  sort: TableSort | undefined
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortValue) return undefined;
  if (sort?.columnKey !== column.key) return 'none';
  return sort.direction === 'asc' ? 'ascending' : 'descending';
}

/** Sort rows by the chosen column using the provided accessor. */
function sortRows<T>(rows: T[], columns: TableColumn<T>[], sort: TableSort | undefined): T[] {
  if (!sort) return rows;
  const accessor = columns.find((candidate) => candidate.key === sort.columnKey)?.sortValue;
  if (!accessor) return rows;

  const factor = sort.direction === 'asc' ? 1 : -1;
  return rows
    .map((item) => ({ item, key: accessor(item) }))
    .sort((a, b) => {
      if (a.key === null && b.key === null) return 0;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      const compared =
        typeof a.key === 'number' && typeof b.key === 'number'
          ? a.key - b.key
          : String(a.key).localeCompare(String(b.key));
      return compared * factor;
    })
    .map((decorated) => decorated.item);
}

/**
 * Follow the first anchor inside the row, preserving modifiers so that
 * ⌘-click / Ctrl-click still opens in a new context. Clicks that land on an
 * interactive element or that are part of a text selection are ignored.
 */
function handleRowClick(event: React.MouseEvent<HTMLTableRowElement>): void {
  const target = event.target as HTMLElement;
  if (target.closest('a, button, input, select, textarea, [role="button"]')) {
    return;
  }
  if (window.getSelection()?.toString()) {
    return;
  }

  const anchor = event.currentTarget.querySelector('a');
  if (!anchor) return;

  event.preventDefault();
  anchor.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: event.button,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    })
  );
}

export function Table<T>({
  label,
  columns,
  rows,
  getRowKey,
  defaultSort,
  bodyContent,
}: TableProps<T>): JSX.Element {
  const [sort, setSort] = useState<TableSort | undefined>(defaultSort);

  const sortedRows = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);
  const rowLinkColumn = useMemo(() => columns.some((column) => column.rowHeader), [columns]);

  // Same column → flip direction; new column → start ascending.
  const toggleSort = (columnKey: string): void =>
    setSort((current) =>
      current?.columnKey === columnKey
        ? { columnKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { columnKey, direction: 'asc' }
    );

  return (
    <table className={styles.table} aria-label={label}>
      <thead>
        <tr>
          {columns.map((column) => {
            const active = sort?.columnKey === column.key;
            return (
              <th
                key={column.key}
                scope="col"
                className={styles.headerCell}
                style={column.width ? { width: column.width } : undefined}
                aria-label={column.headerLabel}
                aria-sort={ariaSort(column, sort)}
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.header}
                    <span
                      className={styles.sortIndicator}
                      data-sort-active={active}
                      aria-hidden="true"
                    >
                      {active ? (
                        <Icon
                          name={sort.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                          size={14}
                        />
                      ) : (
                        <Icon name="chevrons-up-down" size={14} />
                      )}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {bodyContent ??
          sortedRows.map((item) => (
            <tr
              key={getRowKey(item)}
              className={styles.row}
              data-row-link={rowLinkColumn}
              onClick={handleRowClick}
            >
              {columns.map((column) =>
                column.rowHeader ? (
                  <th key={column.key} scope="row" className={styles.rowHeaderCell}>
                    {column.cell(item)}
                  </th>
                ) : (
                  <td key={column.key} className={styles.cell}>
                    {column.cell(item)}
                  </td>
                )
              )}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

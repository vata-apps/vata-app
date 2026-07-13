import { type ReactNode } from 'react';

import { Button } from '$components/ui/button';
import { Skeleton } from '$components/ui/skeleton';
import { Table, type TableColumn, type TableSort } from '$components/ui/table';

import * as styles from './entity-table.css';

export type EntityTableColumn<T> = TableColumn<T>;
export type EntityTableSort = TableSort;

export { rowLink } from './entity-table.css';

/** Props accepted by {@link EntityTable}. */
export interface EntityTableProps<T> {
  /** Accessible label for the table element. */
  label: string;
  /** Column definitions, in display order. */
  columns: EntityTableColumn<T>[];
  /** The rows to render (already sorted by the table when a sort is active). */
  rows: T[];
  /** Stable React key for a row. */
  getRowKey: (item: T) => string;
  /** Whether the underlying query is loading. */
  isLoading: boolean;
  /** Whether the underlying query errored. */
  isError: boolean;
  /** Translated message shown in the error state. */
  errorMessage: string;
  /** Translated message shown when the tree has no rows and no filters are active. */
  emptyMessage: string;
  /**
   * Optional action rendered with the empty message (e.g. "Add the first
   * person").
   */
  emptyAction?: { label: string; onClick: () => void };
  /**
   * Translated message shown when filters are active but matched nothing.
   * When omitted, {@link emptyMessage} is used in both empty states.
   */
  noMatchesMessage?: string;
  /**
   * Optional action rendered with the no-matches message (e.g. "Clear filters").
   */
  noMatchesAction?: { label: string; onClick: () => void };
  /**
   * Whether the current view is filtered. Drives the choice between
   * {@link emptyMessage} and {@link noMatchesMessage}.
   */
  isFiltered?: boolean;
  /** Number of placeholder rows shown while loading. */
  skeletonRows?: number;
  /**
   * Initial sort. The column must declare a `sortValue`. When omitted, rows
   * render in the order given and no header shows a sort indicator until the
   * user clicks one. Sorting is managed internally by {@link Table}.
   */
  defaultSort?: EntityTableSort;
}

const DEFAULT_SKELETON_ROWS = 8;

/** A single state row (loading / empty / error) spanning every column. */
function StateRow({
  span,
  title,
  body,
  action,
}: {
  span: number;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}): JSX.Element {
  return (
    <tr>
      <td colSpan={span} className={styles.stateCell}>
        <p className={styles.stateTitle}>{title}</p>
        {body && <p className={styles.stateBody}>{body}</p>}
        {action && (
          <div className={styles.stateActions}>
            <Button onClick={action.onClick}>{action.label}</Button>
          </div>
        )}
      </td>
    </tr>
  );
}

/**
 * The reusable full-width entity table for an in-tree section page. Rewired
 * on top of {@link Table}: the primitive owns table mechanics (semantics,
 * density, sticky header, sort indicators, row activation), while this
 * organism owns the application concerns (column config, sort accessors,
 * and the loading/error/empty states).
 *
 * Row activation is declarative: the primary column should render a router
 * `Link`. The whole row becomes clickable by following that link, without
 * `onRowClick` leaking into the API.
 */
export function EntityTable<T>({
  label,
  columns,
  rows,
  getRowKey,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  emptyAction,
  noMatchesMessage,
  noMatchesAction,
  isFiltered,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  defaultSort,
}: EntityTableProps<T>): JSX.Element {
  const span = columns.length;

  let bodyContent: ReactNode;

  if (isLoading) {
    bodyContent = Array.from({ length: skeletonRows }, (_, rowIndex) => (
      <tr key={rowIndex} aria-hidden="true">
        {columns.map((column) => (
          <td key={column.key} className={styles.stateCell}>
            <Skeleton style={{ width: '80%' }} />
          </td>
        ))}
      </tr>
    ));
  } else if (isError) {
    bodyContent = <StateRow span={span} title={errorMessage} />;
  } else if (rows.length === 0) {
    if (isFiltered && noMatchesMessage) {
      bodyContent = <StateRow span={span} title={noMatchesMessage} action={noMatchesAction} />;
    } else {
      bodyContent = <StateRow span={span} title={emptyMessage} action={emptyAction} />;
    }
  }

  return (
    <Table
      label={label}
      columns={columns}
      rows={rows}
      getRowKey={getRowKey}
      defaultSort={defaultSort}
      bodyContent={bodyContent}
    />
  );
}

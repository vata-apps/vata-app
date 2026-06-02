import { type ReactNode } from 'react';
import { Flex, Skeleton, Table, Text } from '@radix-ui/themes';

/** A single column of an {@link EntityTable}. */
export interface EntityTableColumn<T> {
  /** Stable key for the column (used as the React key). */
  key: string;
  /** Translated, user-facing column header. */
  header: string;
  /** Renders the cell content for one row. */
  cell: (item: T) => ReactNode;
  /**
   * When true, the column is rendered as the row's `RowHeaderCell` — the
   * primary, scannable column (e.g. the entity name). Exactly one column
   * per table should set this.
   */
  rowHeader?: boolean;
  /** Optional fixed column width (a Radix dimension string, e.g. `"120px"`). */
  width?: string;
}

/** Props accepted by {@link EntityTable}. */
export interface EntityTableProps<T> {
  /** Accessible label for the table element. */
  label: string;
  /** Column definitions, in display order. */
  columns: EntityTableColumn<T>[];
  /** The rows to render (already sorted by the caller). */
  rows: T[];
  /** Stable React key for a row. */
  getRowKey: (item: T) => string;
  /** Called when a row is activated (whole-row click). */
  onRowClick?: (item: T) => void;
  /** Whether the underlying query is loading. */
  isLoading: boolean;
  /** Whether the underlying query errored. */
  isError: boolean;
  /** Translated message shown in the error state. */
  errorMessage: string;
  /** Translated message shown when there are no rows. */
  emptyMessage: string;
  /** Number of placeholder rows shown while loading. */
  skeletonRows?: number;
}

const DEFAULT_SKELETON_ROWS = 8;

/** A full-width state row (loading / empty / error) spanning every column. */
function StateRow({ span, children }: { span: number; children: ReactNode }): JSX.Element {
  return (
    <Table.Row>
      <Table.Cell colSpan={span}>
        <Flex align="center" justify="center" py="6">
          <Text size="2" color="gray" align="center">
            {children}
          </Text>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}

/**
 * The reusable full-width entity table for an in-tree section page: a
 * column header row, a column-driven body, and built-in loading, empty,
 * and error states. Replaces the per-section sidebars and their shared
 * `EntityListPanel`.
 *
 * It is entity-agnostic by composition — each column supplies its own
 * `cell` renderer and the table never inspects row shape, so People,
 * Families, Events, and Places render their own cells through the same
 * frame. The primary column (`rowHeader: true`) should render a router
 * `Link` for keyboard access; `onRowClick` makes the whole row navigable
 * for pointer users.
 *
 * @example
 * <EntityTable
 *   label={t('nav.individuals')}
 *   columns={columns}
 *   rows={rows}
 *   getRowKey={(p) => p.id}
 *   onRowClick={(p) => navigate({ to: detailRoute, params: { id: p.id } })}
 *   isLoading={isLoading}
 *   isError={isError}
 *   errorMessage={t('errors.loadFailed')}
 *   emptyMessage={t('table.empty')}
 * />
 */
export function EntityTable<T>({
  label,
  columns,
  rows,
  getRowKey,
  onRowClick,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  skeletonRows = DEFAULT_SKELETON_ROWS,
}: EntityTableProps<T>): JSX.Element {
  const span = columns.length;

  const body: ReactNode = ((): ReactNode => {
    if (isLoading) {
      return Array.from({ length: skeletonRows }, (_, rowIndex) => (
        <Table.Row key={rowIndex} aria-hidden="true">
          {columns.map((column) => {
            const cell = (
              <Skeleton>
                <Text size="2">—</Text>
              </Skeleton>
            );
            return column.rowHeader ? (
              <Table.RowHeaderCell key={column.key}>{cell}</Table.RowHeaderCell>
            ) : (
              <Table.Cell key={column.key}>{cell}</Table.Cell>
            );
          })}
        </Table.Row>
      ));
    }
    if (isError) return <StateRow span={span}>{errorMessage}</StateRow>;
    if (rows.length === 0) return <StateRow span={span}>{emptyMessage}</StateRow>;
    return rows.map((item) => (
      <Table.Row key={getRowKey(item)} onClick={onRowClick ? () => onRowClick(item) : undefined}>
        {columns.map((column) =>
          column.rowHeader ? (
            <Table.RowHeaderCell key={column.key}>{column.cell(item)}</Table.RowHeaderCell>
          ) : (
            <Table.Cell key={column.key}>{column.cell(item)}</Table.Cell>
          )
        )}
      </Table.Row>
    ));
  })();

  return (
    <Table.Root variant="surface" size="2" aria-label={label}>
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeaderCell key={column.key} width={column.width}>
              {column.header}
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>{body}</Table.Body>
    </Table.Root>
  );
}

import { Database, Tables, TablesInsert, TablesUpdate } from "@/database.types";

/**
 * Creates a type with only the specified keys from T
 */
export type ExtractFields<T, K extends keyof T> = Pick<T, K>;

/**
 * Converts a database table type to a more specific shape
 * with customized nested fields
 */
export type WithRelation<T, K extends string, R> = T & {
  [P in K]: R;
};

/**
 * Type alias for database table row (Tables already returns the Row type)
 */
export type Row<T extends keyof Database["public"]["Tables"]> = Tables<T>;

/**
 * Type alias for database table insert
 */
export type Insert<T extends keyof Database["public"]["Tables"]> =
  TablesInsert<T>;

/**
 * Type alias for database table update
 */
export type Update<T extends keyof Database["public"]["Tables"]> =
  TablesUpdate<T>;

/**
 * Utility for working with database response types
 */
export type DatabaseRecord<
  TableName extends keyof Database["public"]["Tables"],
> = Tables<TableName>;

/**
 * Utility for common response patterns
 */
export type WithPagination<T> = {
  data: T[];
  total: number;
  page: number;
  itemsPerPage: number;
};

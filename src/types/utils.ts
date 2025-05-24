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
 * Standard paginated response type used across API functions
 */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

/**
 * Extended paginated response with metadata
 */
export type WithPagination<T> = {
  data: T[];
  total: number;
  page: number;
  itemsPerPage: number;
};

/**
 * Standard response for single items
 */
export type SingleResponse<T> = {
  data: T;
};

/**
 * Common pattern for names in the system
 */
export type NameRecord = Pick<
  Tables<"names">,
  "first_name" | "last_name" | "is_primary"
>;

/**
 * Common pattern for entities with type information
 */
export type WithType<T, TypeName extends string = "name"> = T & {
  type: { [K in TypeName]: string };
};

/**
 * Common pattern for hierarchical entities with parent relationships
 */
export type WithParent<T, ParentType = Partial<T>> = T & {
  parent?: ParentType | null;
};

/**
 * Utility type for optional fields in forms/updates
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

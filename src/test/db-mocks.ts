import { vi } from "vitest";
import type Database from "@tauri-apps/plugin-sql";

/**
 * Mock function type for better type safety
 */
export type MockFn = ReturnType<typeof vi.fn>;

/**
 * Mock database interface for testing
 */
export interface MockDatabase {
  close: MockFn;
  execute: MockFn;
  select: MockFn;
}

/**
 * Creates a mock database instance with default implementations
 * @param overrides - Optional overrides for specific methods
 * @returns Mock database instance
 */
export function createMockDatabase(
  overrides: Partial<MockDatabase> = {},
): MockDatabase {
  return {
    close: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue({ lastInsertId: 1 }),
    select: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

/**
 * Creates a standard database load implementation for tests
 * @param systemDb - Mock system database
 * @param treeDb - Mock tree database
 * @returns Implementation function for Database.load
 */
export function createStandardDatabaseLoader(
  systemDb: MockDatabase,
  treeDb: MockDatabase,
): (path: string) => Promise<Database> {
  return (path: string) => {
    if (path === "sqlite:system.db") {
      return Promise.resolve(systemDb as unknown as Database);
    } else if (path.startsWith("sqlite:")) {
      return Promise.resolve(treeDb as unknown as Database);
    }
    return Promise.reject(new Error(`Unknown database path: ${path}`));
  };
}

/**
 * Common test constants used across database tests
 */
export const DB_TEST_CONSTANTS = {
  SYSTEM_DB_PATH: "sqlite:system.db",
  TREE_DB_PATH: (path: string) => `sqlite:${path}`,
  DEFAULT_TREE_ID: "1",
  DEFAULT_TREE_PATH: "/path/to/test-tree.db",
  SUCCESS_RESULT: "test result",
  ERROR_MESSAGE: "Test error",
} as const;

/**
 * Suppresses console output during tests
 */
export function suppressConsoleOutput(): void {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}

/**
 * Creates a test tree data object
 * @param overrides - Optional overrides for tree properties
 * @returns Test tree data
 */
export function createTestTreeData(
  overrides: Partial<{
    name: string;
    description: string;
  }> = {},
) {
  const timestamp = Date.now();
  return {
    name: `Test Tree ${timestamp}`,
    description: "Test tree description",
    ...overrides,
  };
}

/**
 * Creates a test individual data object
 * @param overrides - Optional overrides for individual properties
 * @returns Test individual data
 */
export function createTestIndividualData(
  overrides: Partial<{
    gender: "male" | "female" | "unknown";
  }> = {},
) {
  return {
    gender: "male" as const,
    ...overrides,
  };
}

/**
 * Creates a test name data object
 * @param individualId - Individual ID
 * @param overrides - Optional overrides for name properties
 * @returns Test name data
 */
export function createTestNameData(
  individualId: string,
  overrides: Partial<{
    type: "birth" | "marriage" | "nickname" | "unknown";
    first_name: string;
    last_name: string;
    is_primary: boolean;
  }> = {},
) {
  return {
    individual_id: individualId,
    type: "birth" as const,
    first_name: "John",
    last_name: "Doe",
    is_primary: true,
    ...overrides,
  };
}

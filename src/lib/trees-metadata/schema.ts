import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const treesMetadata = sqliteTable("trees_metadata", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  filePath: text("file_path").notNull(), // Relative path to the .db file
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastOpened: integer("last_opened", { mode: "timestamp" }),
  description: text("description"), // Optional description of the tree
  fileExists: integer("file_exists", { mode: "boolean" })
    .notNull()
    .default(true),
});

export type TreeMetadata = typeof treesMetadata.$inferSelect;
export type NewTreeMetadata = typeof treesMetadata.$inferInsert;

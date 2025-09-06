import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Place Types table - defines the different types of places
export const placeTypes = sqliteTable(
  "place_types",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    name: text("name").notNull(),
    key: text("key"), // Optional system key (country, state, city, etc.)
    isSystem: integer("is_system", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => ({
    // System types must have a key, user types must not
    uniqueKey: uniqueIndex("place_types_key_unique").on(table.key),
  }),
);

// Places table - the main places with hierarchical structure
export const places = sqliteTable(
  "places",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    name: text("name").notNull(),
    typeId: integer("type_id")
      .notNull()
      .references(() => placeTypes.id, { onDelete: "restrict" }),
    parentId: integer("parent_id").references((): any => places.id, {
      onDelete: "set null",
    }),
    latitude: real("latitude"),
    longitude: real("longitude"),
    gedcomId: integer("gedcom_id"),
  },
  (table) => ({
    // Unique GEDCOM ID
    uniqueGedcomId: uniqueIndex("places_gedcom_id_unique").on(table.gedcomId),
  }),
);

// Type definitions for TypeScript
export type PlaceType = typeof placeTypes.$inferSelect;
export type NewPlaceType = typeof placeTypes.$inferInsert;
export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;

// Relations
export const placeTypesRelations = relations(placeTypes, ({ many }) => ({
  places: many(places),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  type: one(placeTypes, {
    fields: [places.typeId],
    references: [placeTypes.id],
  }),
  parent: one(places, {
    fields: [places.parentId],
    references: [places.id],
  }),
  children: many(places),
}));

// Extended types with relations
export type PlaceWithType = Place & {
  type: PlaceType;
  parent?: Place;
  children?: Place[];
};

# Places

The `places` table stores locations relevant to genealogical events, with support for hierarchical relationships between places. All places belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                            |
| ---------- | ------------------------ | ------------------------------------------------------ |
| id         | uuid                     | Primary key, automatically generated                   |
| created_at | timestamp with time zone | Timestamp of record creation                           |
| name       | text                     | Name of the place                                      |
| type_id    | uuid                     | Reference to the place type                            |
| parent_id  | uuid                     | Reference to the parent place (nullable)               |
| latitude   | decimal                  | Geographical latitude coordinate (nullable)            |
| longitude  | decimal                  | Geographical longitude coordinate (nullable)           |
| gedcom_id  | bigint                   | Tree-specific auto-incrementing readable ID            |
| tree_id    | uuid                     | Reference to the tree this place belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Belongs to one `place_type` through `type_id`
- Can have one parent `place` through `parent_id`
- Can have many child `places` referencing this place as their parent
- Has many `events` through `place_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- Places can be organized hierarchically (e.g., city -> state -> country)
- Geographical coordinates are optional but useful for mapping
- The `type_id` helps categorize places (e.g., country, state, city, cemetery)
- The `gedcom_id` is unique within each tree (composite unique constraint with `tree_id`) and starts from 1 for each tree
- Places can be referenced by events in the unified event system
- All places must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated places are automatically deleted (CASCADE)

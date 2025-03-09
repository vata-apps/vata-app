# Places

The `places` table stores locations relevant to genealogical events, with support for hierarchical relationships between places.

## Schema

| Column     | Type                     | Description                                  |
| ---------- | ------------------------ | -------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated         |
| created_at | timestamp with time zone | Timestamp of record creation                 |
| name       | text                     | Name of the place                            |
| type_id    | uuid                     | Reference to the place type                  |
| parent_id  | uuid                     | Reference to the parent place (nullable)     |
| latitude   | decimal                  | Geographical latitude coordinate (nullable)  |
| longitude  | decimal                  | Geographical longitude coordinate (nullable) |

## Relationships

- Belongs to one `place_type` through `type_id`
- Can have one parent `place` through `parent_id`
- Can have many child `places` referencing this place as their parent
- Has many `individual_events` through `place_id`
- Has many `family_events` through `place_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- Places can be organized hierarchically (e.g., city -> state -> country)
- Geographical coordinates are optional but useful for mapping
- The `type_id` helps categorize places (e.g., country, state, city, cemetery)
- Places can be referenced by both individual and family events

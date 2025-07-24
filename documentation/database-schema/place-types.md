# Place Types

The `place_types` table defines the different types of places that can be recorded in the genealogical database. All place types belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| name       | text                     | Name of the place type                                      |
| key        | text                     | Unique identifier for system place types (nullable)         |
| is_system  | boolean                  | Indicates if this is a system type (default: false)         |
| tree_id    | uuid                     | Reference to the tree this place type belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `places` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following system place types are pre-populated in the default tree during database initialization:

| Name     | Key      | is_system |
| -------- | -------- | --------- |
| Country  | country  | true      |
| State    | state    | true      |
| Province | province | true      |
| City     | city     | true      |
| Town     | town     | true      |
| Village  | village  | true      |
| Address  | address  | true      |
| Cemetery | cemetery | true      |
| Church   | church   | true      |
| Hospital | hospital | true      |
| Other    | other    | true      |

## Constraints

- Each place type name must be unique within a tree (composite unique constraint with `tree_id`)
- Each key must be unique within a tree (composite unique constraint with `tree_id`)
- Only system types (`is_system = true`) can have a key
- User types (`is_system = false`) must have `key = NULL`

## Notes

- The list of place types helps standardize place categorization within each tree
- System types have predefined keys for programmatic access
- User types allow for flexible customization without keys
- New user types can be added as needed for each tree
- All place types must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated place types are automatically deleted (CASCADE)

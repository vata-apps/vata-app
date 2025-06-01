# Place Types

The `place_types` table defines the different types of places that can be recorded in the genealogical database. All place types belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| name       | text                     | Name of the place type                                      |
| tree_id    | uuid                     | Reference to the tree this place type belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `places` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following place types are pre-populated in the default tree during database initialization:

- country
- state
- province
- city
- town
- village
- address
- cemetery
- church
- hospital
- other

## Notes

- Each place type name must be unique within a tree (composite unique constraint with `tree_id`)
- The list of place types helps standardize place categorization within each tree
- The pre-populated types cover common genealogical place categories
- New types can be added as needed for each tree
- All place types must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated place types are automatically deleted (CASCADE)

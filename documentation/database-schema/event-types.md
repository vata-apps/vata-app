# Event Types

The `event_types` table defines the different types of events that can be recorded in the genealogical database. This unified system handles both individual and family event types. All event types belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| name       | text                     | Name of the event type                                      |
| key        | text                     | Unique identifier for system event types (nullable)         |
| is_system  | boolean                  | Indicates if this is a system type (default: false)         |
| tree_id    | uuid                     | Reference to the tree this event type belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `events` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event types are pre-populated in the default tree during database initialization:

| Name        | Key         | is_system |
| ----------- | ----------- | --------- |
| Birth       | birth       | true      |
| Death       | death       | true      |
| Marriage    | marriage    | true      |
| Baptism     | baptism     | true      |
| Burial      | burial      | true      |
| Immigration | immigration | true      |
| Census      | census      | true      |
| Engagement  | engagement  | true      |
| Separation  | separation  | true      |
| Retirement  | retirement  | true      |
| Other       | other       | true      |

## Constraints

- Each event type name must be unique within a tree (composite unique constraint with `tree_id`)
- Each key must be unique within a tree (composite unique constraint with `tree_id`)
- Only system types (`is_system = true`) can have a key
- User types (`is_system = false`) must have `key = NULL`

## Notes

- The list of event types helps standardize event categorization within each tree
- The pre-populated types cover common life events and family events in genealogical research
- New types can be added as needed for each tree
- The unified system eliminates the need for separate individual and family event types
- All event types must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated event types are automatically deleted (CASCADE)

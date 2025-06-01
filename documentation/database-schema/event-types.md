# Event Types

The `event_types` table defines the different types of events that can be recorded in the genealogical database. This unified system handles both individual and family event types. All event types belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| name       | text                     | Name of the event type                                      |
| tree_id    | uuid                     | Reference to the tree this event type belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `events` through `type_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event types are pre-populated in the default tree during database initialization:

- birth
- death
- marriage
- baptism
- burial
- graduation
- immigration
- emigration
- naturalization
- census
- will
- probate
- engagement
- divorce
- annulment
- separation
- retirement
- other

## Notes

- Each event type name must be unique within a tree (composite unique constraint with `tree_id`)
- The list of event types helps standardize event categorization within each tree
- The pre-populated types cover common life events and family events in genealogical research
- New types can be added as needed for each tree
- The unified system eliminates the need for separate individual and family event types
- All event types must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated event types are automatically deleted (CASCADE)

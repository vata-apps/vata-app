# Individuals

The `individuals` table stores basic information about each person in the genealogical database. All individuals belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| gender     | gender                   | Gender of the individual (enum: male, female)               |
| gedcom_id  | bigint                   | Tree-specific auto-incrementing ID for GEDCOM compatibility |
| tree_id    | uuid                     | Reference to the tree this individual belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `names` through `individual_id`
- Has many `event_subjects` through `individual_id` (for events they are the subject of)
- Has many `event_participants` through `individual_id` (for events they participated in)
- Can be a husband in multiple `families` through `husband_id`
- Can be a wife in multiple `families` through `wife_id`
- Can be a child in multiple `family_children` through `individual_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- The `gedcom_id` is unique within each tree (composite unique constraint with `tree_id`) and starts from 1 for each tree
- All individuals must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated individuals are automatically deleted (CASCADE)

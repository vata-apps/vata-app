# Family Children

The `family_children` table links children to their families, creating the parent-child relationships in the genealogical database. All family-child relationships belong to a specific family tree.

## Schema

| Column        | Type                     | Description                                                   |
| ------------- | ------------------------ | ------------------------------------------------------------- |
| id            | uuid                     | Primary key, automatically generated                          |
| created_at    | timestamp with time zone | Timestamp of record creation                                  |
| family_id     | uuid                     | Reference to the family                                       |
| individual_id | uuid                     | Reference to the individual who is the child                  |
| tree_id       | uuid                     | Reference to the tree this relationship belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Belongs to one `family` through `family_id`
- Belongs to one `individual` through `individual_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- This is a junction table that creates the relationship between families and their children
- An individual can be a child in multiple families (e.g., biological family and adoptive family)
- A family can have multiple children
- The same individual cannot be both a parent and a child in the same family
- All family-child relationships must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated family-child relationships are automatically deleted (CASCADE)

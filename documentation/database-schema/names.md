# Names

The `names` table stores different names associated with individuals, including birth names, married names, nicknames, etc. All names belong to a specific family tree.

## Schema

| Column        | Type                     | Description                                             |
| ------------- | ------------------------ | ------------------------------------------------------- |
| id            | uuid                     | Primary key, automatically generated                    |
| created_at    | timestamp with time zone | Timestamp of record creation                            |
| individual_id | uuid                     | Reference to the individual this name belongs to        |
| first_name    | text                     | First name(s) of the individual                         |
| last_name     | text                     | Last name of the individual                             |
| surname       | text                     | Surname (can differ from last name in some cultures)    |
| type          | name_type                | Type of name (enum: birth, marriage, nickname, unknown) |
| is_primary    | boolean                  | Whether this is the primary name for the individual     |
| tree_id       | uuid                     | Reference to the tree this name belongs to (NOT NULL)   |

## Relationships

- Belongs to one `tree` through `tree_id`
- Belongs to one `individual` through `individual_id`

## Row Level Security

Row level security is enabled on this table.

## Notes

- An individual can have multiple names with different types
- Only one name per individual should be marked as primary (`is_primary = true`)
- The `surname` field allows for recording surnames that might differ from the `last_name` in cultures where this distinction is important
- All names must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated names are automatically deleted (CASCADE)

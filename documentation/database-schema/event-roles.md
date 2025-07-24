# Event Roles

The `event_roles` table defines the different roles that individuals can have when participating in events. This provides standardized role definitions for event participation. All event roles belong to a specific family tree.

## Schema

| Column     | Type                     | Description                                                 |
| ---------- | ------------------------ | ----------------------------------------------------------- |
| id         | uuid                     | Primary key, automatically generated                        |
| created_at | timestamp with time zone | Timestamp of record creation                                |
| name       | text                     | Name of the role                                            |
| key        | text                     | Unique identifier for system roles (nullable)               |
| is_system  | boolean                  | Indicates if this is a system role (default: false)         |
| tree_id    | uuid                     | Reference to the tree this event role belongs to (NOT NULL) |

## Relationships

- Belongs to one `tree` through `tree_id`
- Has many `event_participants` through `role_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event roles are pre-populated in the default tree during database initialization:

| Name              | Key               | is_system |
| ----------------- | ----------------- | --------- |
| Subject           | subject           | true      |
| Husband           | husband           | true      |
| Wife              | wife              | true      |
| Deceased          | deceased          | true      |
| Mother            | mother            | true      |
| Father            | father            | true      |
| Witness           | witness           | true      |
| Godfather         | godfather         | true      |
| Godmother         | godmother         | true      |
| Officiant         | officiant         | true      |
| Doctor            | doctor            | true      |
| Midwife           | midwife           | true      |
| Informant         | informant         | true      |
| Guardian          | guardian          | true      |
| Executor          | executor          | true      |
| Beneficiary       | beneficiary       | true      |
| Father of Husband | father_of_husband | true      |
| Mother of Husband | mother_of_husband | true      |
| Father of Wife    | father_of_wife    | true      |
| Mother of Wife    | mother_of_wife    | true      |
| Other             | other             | true      |

## Role Categories

### Primary Roles

- **Subject**: The main person the event is about
- **Husband/Wife**: Spouses in marriage-related events
- **Deceased**: The person who died in death-related events

### Family Roles

- **Mother/Father**: Parents of the subject
- **Father of Husband/Wife**: Parents of spouses
- **Mother of Husband/Wife**: Parents of spouses

### Religious Roles

- **Godfather/Godmother**: Sponsors in baptism events
- **Officiant**: Person conducting the ceremony

### Professional Roles

- **Doctor**: Medical professional involved
- **Midwife**: Birth attendant
- **Informant**: Person providing information

### Legal Roles

- **Witness**: Legal witness to the event
- **Guardian**: Legal guardian
- **Executor**: Executor of a will
- **Beneficiary**: Beneficiary of a will

## Constraints

- Each role name must be unique within a tree (composite unique constraint with `tree_id`)
- Each key must be unique within a tree (composite unique constraint with `tree_id`)
- Only system roles (`is_system = true`) can have a key
- User roles (`is_system = false`) must have `key = NULL`

## Notes

- Roles help standardize how individuals are connected to events within each tree
- New roles can be added as needed for specific genealogical contexts in each tree
- The "Other" role provides flexibility for unusual situations
- Roles are reusable across different event types within the same tree
- All event roles must belong to a valid tree via `tree_id`
- When a tree is deleted, all associated event roles are automatically deleted (CASCADE)

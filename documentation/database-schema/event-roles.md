# Event Roles

The `event_roles` table defines the different roles that individuals can have when participating in events. This provides standardized role definitions for event participation.

## Schema

| Column     | Type                     | Description                          |
| ---------- | ------------------------ | ------------------------------------ |
| id         | uuid                     | Primary key, automatically generated |
| created_at | timestamp with time zone | Timestamp of record creation         |
| name       | text                     | Name of the role                     |

## Relationships

- Has many `event_participants` through `role_id`

## Row Level Security

Row level security is enabled on this table.

## Default Values

The following event roles are pre-populated in the database:

- Subject
- Husband
- Wife
- Deceased
- Mother
- Father
- Witness
- Godfather
- Godmother
- Officiant
- Doctor
- Midwife
- Informant
- Guardian
- Executor
- Beneficiary
- Father of Husband
- Mother of Husband
- Father of Wife
- Mother of Wife
- Other

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

## Notes

- Each role must have a unique name
- Roles help standardize how individuals are connected to events
- New roles can be added as needed for specific genealogical contexts
- The "Other" role provides flexibility for unusual situations
- Roles are reusable across different event types

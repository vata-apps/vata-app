# Event Participants

The `event_participants` table links events to all individuals involved in the event, with specific roles defining their participation. This includes both subjects and other participants like witnesses, officiants, etc.

## Schema

| Column        | Type                     | Description                          |
| ------------- | ------------------------ | ------------------------------------ |
| id            | uuid                     | Primary key, automatically generated |
| created_at    | timestamp with time zone | Timestamp of record creation         |
| event_id      | uuid                     | Reference to the event               |
| individual_id | uuid                     | Reference to the individual          |
| role_id       | uuid                     | Reference to the event role          |

## Relationships

- Belongs to one `event` through `event_id`
- Belongs to one `individual` through `individual_id`
- Belongs to one `event_role` through `role_id`

## Row Level Security

Row level security is enabled on this table.

## Usage Examples

- **Marriage Event**:

  - Husband (role: "Husband")
  - Wife (role: "Wife")
  - Officiant (role: "Officiant")
  - Witnesses (role: "Witness")
  - Parents (roles: "Father of Husband", "Mother of Wife", etc.)

- **Birth Event**:

  - Newborn (role: "Subject")
  - Mother (role: "Mother")
  - Father (role: "Father")
  - Doctor (role: "Doctor")
  - Midwife (role: "Midwife")

- **Death Event**:
  - Deceased (role: "Deceased")
  - Doctor (role: "Doctor")
  - Informant (role: "Informant")

## Notes

- This table captures all individuals involved in an event, not just the primary subjects
- The role defines how each person was involved in the event
- An individual can have multiple roles in the same event if needed
- This flexible system allows for detailed recording of event participation
- The combination of event_id, individual_id, and role_id should be unique

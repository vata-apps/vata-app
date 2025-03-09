# Database Schema Documentation

This directory contains documentation for the database schema used in the Vata App. The schema is designed to store genealogical data including individuals, families, events, places, and their relationships.

## Entities

- [Families](./families.md) - Represents family units and their relationships
- [Family Children](./family-children.md) - Links children to their families
- [Family Events](./family-events.md) - Records events related to families (marriage, divorce, etc.)
- [Family Event Types](./family-event-types.md) - Types of events that can be associated with families
- [Individuals](./individuals.md) - Represents individual persons
- [Individual Events](./individual-events.md) - Records events related to individuals (birth, death, etc.)
- [Individual Event Types](./individual-event-types.md) - Types of events that can be associated with individuals
- [Names](./names.md) - Records different names associated with individuals
- [Places](./places.md) - Represents locations and their hierarchical relationships
- [Place Types](./place-types.md) - Types of places that can be recorded

## Enums

- `gender` - Values: `male`, `female`
- `name_type` - Values: `birth`, `marriage`, `nickname`, `unknown`
- `family_type` - Values: `married`, `civil union`, `unknown`, `unmarried`

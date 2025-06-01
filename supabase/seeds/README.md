# Vata App - Seed Data Documentation

This folder contains the seed data for the Vata genealogy application. The data is structured to demonstrate the application's functionality using fictional family trees from popular universes.

## 📁 File Structure

The seed files are organized numerically by execution order and logically by data type:

### Core Structure Files

- `00-00-trees.sql` - Root trees (family universes)
- `01-00-individuals.sql` - Individual people in the trees
- `01-01-names.sql` - Names associated with individuals
- `02-00-families.sql` - Family units and marriages
- `02-01-family-children.sql` - Parent-child relationships
- `03-00-places.sql` - Geographic locations
- `03-01-place-types.sql` - Place type classifications
- `04-00-events.sql` - Life events (births, marriages, deaths)
- `04-10-event-participants.sql` - People involved in events
- `04-10-event-subjects.sql` - Event subjects/themes

### Helper Functions

- `functions/` - Contains UUID generation functions used during seeding
- `99-99-cleanup.sql` - Removes helper functions after seeding

## 🎯 Sample Data Universes

The seed data includes three fictional family trees:

1. **Harry Potter (`hp`)** - Wizarding world families (currently populated)
2. **Game of Thrones (`got`)** - Noble houses (placeholder for future data)
3. **Nos Étés (`ete`)** - French novel families (placeholder for future data)

## 🔢 UUID Pattern System

The seed data uses a sophisticated UUID pattern to ensure consistent, meaningful, and collision-free identifiers across all entities.

### UUID Structure Format

All UUIDs follow this pattern:

```
XXXXXXXX-YYYY-ZZZZ-WWWW-VVVVVVVVVVVV
```

Where:

- **XXXXXXXX** (8 digits): Tree/Universe identifier
- **YYYY** (4 digits): Entity type identifier (currently 1, 2, 3, 4)
- **ZZZZ** (4 digits): Sub-type identifier for entity variations
- **WWWW** (4 digits): Generation/Category identifier
- **VVVVVVVVVVVV** (12 digits): Sequential entity number

### Tree Identifiers (Position 1-8)

| Tree Code | UUID Prefix | Description              |
| --------- | ----------- | ------------------------ |
| `hp`      | `00000001`  | Harry Potter universe    |
| `got`     | `00000002`  | Game of Thrones universe |
| `ete`     | `00000003`  | Nos Étés universe        |

### Entity Type Identifiers (Position 10-13)

| Entity Type | UUID Value | Description            |
| ----------- | ---------- | ---------------------- |
| Individuals | `0001`     | People in family trees |
| Families    | `0002`     | Family units/marriages |
| Places      | `0003`     | Geographic locations   |
| Events      | `0004`     | Life events            |

### Sub-type Identifiers (Position 15-18)

Sub-types provide variations within each main entity type:

| Main Type   | Sub-type | UUID Value | Description                       |
| ----------- | -------- | ---------- | --------------------------------- |
| Individuals | Main     | `0000`     | Core individual records           |
| Individuals | Names    | `0001`     | Names associated with individuals |
| Families    | Main     | `0000`     | Core family records               |
| Families    | Children | `0001`     | Parent-child relationships        |
| Places      | Main     | `0000`     | Core place records                |
| Places      | Types    | `0001`     | Place classifications             |
| Events      | Main     | `0000`     | Core event records                |
| Events      | Types    | `0001`     | Event classifications             |
| Events      | Roles    | `0002`     | Participant roles in events       |

### Generation/Category Identifiers (Position 20-23)

For **Individuals** and **Families**, this represents genealogical generations:

- `0001` - Generation 1 (youngest)
- `0002` - Generation 2
- `0003` - Generation 3
- `0004` - Generation 4 (oldest in current data)
- `0005` - Generation 5 (unknown parents)

For other entities, this may represent categories or simply increment from `0001`.

### Sequential Numbers (Position 25-36)

Simple incremental numbering starting from `000000000001` within each category.

## 🎯 UUID Examples

Here are real examples from the Harry Potter data:

```sql
-- Harry Potter tree
'000000001-0000-0000-0000-000000000000'

-- Harry Potter (individual, main type, generation 2, #8)
'00000001-0001-0000-0002-000000000008'

-- Harry Potter's birth name (individual, names subtype, generation 2, #14)
'00000001-0001-0001-0002-000000000014'

-- Harry and Ginny's family (family, main type, generation 2, #1)
'00000001-0002-0000-0002-000000000001'

-- Harry and Ginny's children relationship (family, children subtype, generation 2, #1)
'00000001-0002-0001-0002-000000000001'

-- Fleamont Potter (individual, main type, generation 4, #1)
'00000001-0001-0000-0004-000000000001'

-- Birth event for Harry Potter (event, main type, category 1, #1)
'00000001-0004-0000-0001-000000000001'

-- Place type "country" (place, types subtype, category 0, #1)
'00000001-0003-0001-0000-000000000001'
```

## 🔧 Helper Functions

During seeding, helper functions generate UUIDs based on meaningful keys:

```sql
-- Tree functions
get_tree_id('hp') → '00000001-0000-0000-0000-000000000000'

-- Individual functions (main type)
get_individual_id('harry_potter') → '00000001-0001-0000-0002-000000000008'

-- Name functions (individuals subtype)
get_name_id('harry_potter_birth') → '00000001-0001-0001-0002-000000000014'

-- Family functions (main type)
get_family_id('harry_ginny') → '00000001-0002-0000-0002-000000000001'

-- Family children functions (families subtype)
get_family_children_id('harry_ginny_children') → '00000001-0002-0001-0002-000000000001'

-- Place functions (main type)
get_place_id('london') → '00000001-0003-0000-0001-000000000001'

-- Place type functions (places subtype)
get_place_type_id('city') → '00000001-0003-0001-0000-000000000004'
```

These functions are automatically cleaned up after seeding via `99-99-cleanup.sql`.

## 📋 Guidelines for Adding New Seed Data

### 1. Adding a New Universe/Tree

1. Update `functions/00-00-get_tree_id.sql` with new tree key
2. Use next available tree number (e.g., `00000004`)
3. Add tree record in `00-00-trees.sql`

### 2. Adding Individuals

1. Update `functions/01-00-get_individual_id.sql` with new individual keys
2. Follow the UUID pattern: `[tree_id]-0001-0000-[generation]-[sequence]`
3. Organize by generations (older = higher generation number)
4. Add records to `01-00-individuals.sql`

### 3. Adding Events

1. Update relevant event helper functions
2. Follow chronological order when possible
3. Use appropriate event types and roles

### 4. Maintaining Data Integrity

- **Always use helper functions** for UUID generation, never hardcode UUIDs
- **Test your data** with `pnpm db:reset` before committing
- **Follow naming conventions** for keys (e.g., `firstname_lastname`, `family1_family2`)
- **Document your additions** with clear comments
- **Respect the generation hierarchy** for family relationships

### 5. Generation Guidelines

When assigning generations:

- **Count from youngest to oldest** (Generation 1 = children, Generation 4 = great-grandparents)
- **Unknown parents** go in Generation 5
- **Use consistent numbering** within each generation
- **Consider family relationships** when determining generations

## 🚀 Running Seed Data

To apply the seed data:

```bash
# Reset database and apply all seeds
pnpm db:reset
```

The seeds are applied in numerical order, and helper functions are automatically cleaned up at the end.

## 📊 Current Data Statistics

### Harry Potter Universe

- **Individuals**: 42 people across 4 generations
- **Families**: 13 family units
- **Events**: Multiple births, marriages, and life events
- **Places**: Various magical and muggle locations

### Planned Additions

- Game of Thrones noble houses
- Nos Étés family tree
- Additional events and places

## 🔍 Troubleshooting

### Common Issues

1. **UUID Conflicts**: Ensure you're using the next available sequence number
2. **Missing References**: Verify all referenced IDs exist in helper functions
3. **Generation Confusion**: Double-check generation assignments match family relationships
4. **Key Naming**: Use consistent, descriptive keys for all entities

### Validation

Always test new seed data with:

```bash
pnpm db:reset
```

Check for:

- No SQL errors during seeding
- Proper foreign key relationships
- Logical family structures
- Correct UUID patterns

---

_This documentation is maintained to help developers understand and extend the seed data system. When adding new data, please update this README accordingly._

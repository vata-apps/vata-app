# English Only

Everything in this project must be written in English.

## Scope

- **Code**: Variable names, function names, class names, comments, JSDoc
- **Documentation**: README, docs, architecture notes, API descriptions
- **Strings**: User-facing messages, error messages, logs, UI labels — **must use i18n**, never hardcode
- **Tests**: Test descriptions, assertion messages, test file names
- **Git**: Commit messages, PR titles, branch names

## Examples

```typescript
// ❌ BAD
// Récupère les données utilisateur
const utilisateur = await getUtilisateur();

// ✅ GOOD
// Fetches user data
const user = await getUser();
```

```typescript
// ❌ BAD
throw new Error('Échec de la connexion');

// ✅ GOOD
throw new Error('Connection failed');
```

## i18n for User-Facing Strings

**Deferred to MVP4.** Until then, hardcoded English strings are acceptable. Do not set up an i18n library before MVP4.

All user-facing strings (UI labels, messages, errors shown to users) must go through the i18n system. Do not hardcode them.

```typescript
// ❌ BAD
<button>Save</button>
toast.error("Connection failed");

// ✅ GOOD
<button>{t('common.save')}</button>
toast.error(t('errors.connectionFailed'));
```

---

# No SELECT \*

Never use `SELECT *` in SQL. Always list the columns you need explicitly.

## Why

- **Stability**: New columns added later do not change the shape of the result or break callers.
- **Performance**: Only fetch the data you use; less data over the wire and in memory.
- **Clarity**: The query documents exactly which fields are used.

## Scope

Applies to any SQL: raw strings, query builders (e.g. Drizzle, Kysely), migrations, and documentation examples.

## Examples

```sql
-- ❌ BAD
SELECT * FROM individuals;
SELECT * FROM individuals WHERE id = ?;

-- ✅ GOOD
SELECT id, given_name, surname, sex, birth_date FROM individuals;
SELECT id, given_name, surname FROM individuals WHERE id = ?;
```

```typescript
// ❌ BAD (Drizzle-style)
const rows = await db.select().from(individuals);

// ✅ GOOD
const rows = await db
  .select({
    id: individuals.id,
    givenName: individuals.givenName,
    surname: individuals.surname,
  })
  .from(individuals);
```

When using a query builder, select only the columns required by the caller, not every column from the table.

---

# Available Skills

The following specialized skills are loaded automatically when relevant, or on demand via the skill tool.

| Skill                  | Trigger                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `sqlite-standards`     | When writing `src/db/**`, SQL queries, migrations, or DB-related docs         |
| `gedcom-standards`     | When writing `src/lib/gedcom/**`, GEDCOM docs, or XREF/tag code               |
| `docs-consistency`     | After any change to `docs/*.md`                                               |
| `typescript-standards` | When writing `src/**/*.{ts,tsx}` (components, hooks, managers, store, routes) |
| `tauri-standards`      | When writing `src-tauri/**/*.rs` or `tauri.conf.json`                         |
| `testing-standards`    | When writing `**/*.{test,spec}.{ts,tsx}` or setting up test infrastructure    |
| `mvp-tracker`          | When implementing new features or verifying MVP3 scope                        |

---

# Granular Commits

Commit early and often. Each commit should represent a single, complete unit of work that can be reverted independently.

## Why

- **Easy reverts**: If something breaks, you can revert just the problematic change without losing unrelated work.
- **Clear history**: Small commits make it easier to understand what changed and why.
- **Safer refactoring**: Breaking changes into small steps reduces risk.

## When to Commit

Commit immediately after completing any of these:

- A new function or component that works
- A bug fix (even a one-liner)
- A refactor that doesn't change behavior
- Adding or updating tests
- Schema or migration changes
- Documentation updates
- Dependency changes (`package.json`, `Cargo.toml`)

## Commit Message Format

Use conventional commits:

```
<type>: <short description>

# Examples
feat: add birth date picker to individual form
fix: prevent duplicate family relationships
refactor: extract date formatting to utility
test: add coverage for GEDCOM date parsing
docs: update database schema documentation
chore: upgrade drizzle-orm to 0.30.0
```

## Anti-patterns

```
# ❌ BAD: Too large, mixed concerns
git commit -m "feat: implement entire family tree view with tests and docs"

# ❌ BAD: Vague
git commit -m "fix stuff"
git commit -m "wip"

# ✅ GOOD: Small, focused
git commit -m "feat: add FamilyTreeNode component"
git commit -m "feat: implement tree layout algorithm"
git commit -m "test: add FamilyTreeNode unit tests"
git commit -m "docs: add family tree architecture notes"
```

## Rule

After completing each distinct piece of work, commit it before moving to the next task. Do not accumulate multiple unrelated changes in a single commit.

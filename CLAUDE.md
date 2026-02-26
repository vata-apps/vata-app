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
throw new Error("Échec de la connexion");

// ✅ GOOD
throw new Error("Connection failed");
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

# No SELECT *

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

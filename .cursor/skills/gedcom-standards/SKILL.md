---
name: gedcom-standards
description: Ensures GEDCOM 5.5.1 compliance in code and documentation. Use when writing or reviewing GEDCOM import/export code (src/lib/gedcom/**), GedcomManager, GEDCOM-related docs (gedcom-551-mapping.md, mvp-2-gedcom/), or any code that references GEDCOM tags, XREFs, or genealogical data exchange.
---

# GEDCOM 5.5.1 Standards

Apply this skill when writing or reviewing any GEDCOM-related code or documentation. Vata supports **GEDCOM 5.5.1 only**.

## When to Apply

- Writing or reviewing `src/lib/gedcom/**` (importer, exporter)
- Writing or reviewing `src/managers/GedcomManager.ts`
- Updating GEDCOM-related Discussions: "GEDCOM 5.5.1 Mapping" (Product category), "MVP2: GEDCOM" (Product category)
- Any code that handles GEDCOM tags, XREFs, or genealogical data exchange

---

## 1. External Libraries

- **`gedcom-parser`**: All parsing (`parseDocument`), serialization (`serialize`), and validation (`validate`). Never write custom GEDCOM parsing logic.
- **`gedcom-date`**: All date parsing (`parse`), formatting (`format`), sort-date generation (`toSortDate`). Never write custom GEDCOM date parsing.

---

## 2. Import Rules

### Two-Phase Strategy

1. **Phase 1**: Import individuals (with names and events) — no family links yet
2. **Phase 2**: Import families and link members using XREF mappings

Never import families before all individuals are created.

### Transaction Management

- Wrap the entire import in `BEGIN TRANSACTION` / `COMMIT`
- On any error, execute `ROLLBACK` before rethrowing
- Individual record errors are caught and collected in `stats.errors` without aborting the whole import

### XREF Mapping

- Maintain a `xrefToId: Map<string, string>` that maps GEDCOM XREFs to database IDs
- Populate during Phase 1 (individuals), consume during Phase 2 (families)
- XREF format: `@X123@` where X is one of: `I` (Individual), `F` (Family), `S` (Source), `R` (Repository), `N` (Note)

### Place Caching

- Maintain a `placeCache: Map<string, string>` to avoid creating duplicate places
- Check cache first, then database, then create a new place

### Error Reporting

- Format: `INDI I1: {message}` or `FAM F1: {message}` (record type + XREF + message)

### File Extensions

- Accept `.ged` and `.gedcom` on import

---

## 3. Export Rules

### Encoding and Format

- Always export in **UTF-8**
- Line continuation (CONC/CONT) is handled by `gedcom-parser` — do not implement manually

### XREF Generation

- Generate fresh sequential XREFs on export: `I1`, `I2`, ... for individuals; `F1`, `F2`, ... for families
- Maintain `individualXrefs: Map<string, string>` and `familyXrefs: Map<string, string>` (DB ID → XREF)

### Privacy

- Support an `includePrivate` option to optionally exclude living individuals (`is_living = 1`)

### File Extension

- Export as `.ged`

---

## 4. Entity Mapping

### Individual (INDI)

| GEDCOM | Table       | Field       | Notes                      |
|--------|-------------|-------------|----------------------------|
| SEX    | individuals | gender      | Only `M`, `F`, or `U`     |
| FAMC   | family_members | —        | role = `child`             |
| FAMS   | family_members | —        | role = `husband` or `wife` |

### Name (NAME sub-tags)

| GEDCOM | Vata Field  | Notes                                  |
|--------|-------------|----------------------------------------|
| GIVN   | given_names | From explicit tag or parsed NAME value |
| SURN   | surname     | From explicit tag or parsed NAME value |
| NPFX   | prefix      | e.g. "Dr.", "Mr."                      |
| NSFX   | suffix      | e.g. "Jr.", "III"                      |
| NICK   | nickname    |                                        |
| TYPE   | type        | `birth`, `married`, `aka`, etc.        |
| SPFX   | surname     | Merged into surname                    |

Name format: `Given Names /Surname/ Suffix`. Parsing is handled by `gedcom-parser`.

### Family (FAM)

| GEDCOM | Table          | Field                       |
|--------|----------------|-----------------------------|
| HUSB   | family_members | role = `husband`            |
| WIFE   | family_members | role = `wife`               |
| CHIL   | family_members | role = `child`, sort_order  |

---

## 5. Event Types

### System Event Types

- Have a non-null `event_types.tag` (GEDCOM code, e.g. `BIRT`, `DEAT`, `MARR`)
- Display name resolved via **i18n**, never hardcoded
- On export, use the tag directly (e.g. `1 BIRT`)

### Custom Event Types

- `event_types.tag` is `null`, `event_types.custom_name` holds the name
- On export: `1 EVEN` followed by `2 TYPE {custom_name}`
- On import: `EVEN` tag with a `TYPE` sub-tag maps to a custom event type

### Individual Event Tags

`BIRT`, `CHR`, `DEAT`, `BURI`, `CREM`, `ADOP`, `BAPM`, `BARM`, `BASM`, `CONF`, `FCOM`, `ORDN`, `NATU`, `EMIG`, `IMMI`, `CENS`, `PROB`, `WILL`, `GRAD`, `RETI`, `EVEN`, `CAST`, `DSCR`, `EDUC`, `IDNO`, `NATI`, `NCHI`, `NMR`, `OCCU`, `PROP`, `RELI`, `RESI`, `SSN`, `TITL`

### Family Event Tags

`ANUL`, `CENS`, `DIV`, `DIVF`, `ENGA`, `MARB`, `MARC`, `MARL`, `MARR`, `MARS`, `EVEN`

---

## 6. Date Storage

- `date_original` (`TEXT`): Original GEDCOM string preserved as-is (e.g. `"ABT 15 JAN 1845"`)
- `date_sort` (`TEXT`): ISO string for sorting, generated by `toSortDate(parse(dateOriginal))`
- Missing month/day defaults to `01` in sort date
- Ranges use the start date for sorting
- Never modify `date_original` — it is the source of truth

---

## 7. Place Types

- Place types (`place_types` table) are **application-specific**, not part of GEDCOM 5.5.1
- Do not map place types to/from GEDCOM on import/export

---

## 8. Unsupported Tags

These tags are **silently ignored** on import:

| Tag  | Reason                          |
|------|---------------------------------|
| OBJE | Media — future phase            |
| BLOB | Obsolete binary                 |
| ASSO | Complex associations            |
| ALIA | Alias — use NAME instead        |
| ANCI | Genealogical interest           |
| DESI | Genealogical interest           |
| SUBM | Submitter — not relevant locally |
| SUBN | Submission — not relevant locally |

Do not error on unsupported tags. Do not export them.

---

## 9. Validation

- Use `validate()` from `gedcom-parser` for pre-import validation
- Invalid files should report: "Not a valid GEDCOM 5.5.1 file"
- Validation stats should report individual and family counts

---

## Quick Reference

For a concise review checklist, see [checklist.md](checklist.md).

For the full GEDCOM-to-Vata mapping, see the "GEDCOM 5.5.1 Mapping" Discussion (Product category).

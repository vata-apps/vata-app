# Genealogical Date Formats

> Parsing, formatting, validation, and all date logic are handled by the in-app module `@vata-apps/gedcom-date`. This document covers what matters for the Vata app: user input formats, storage, and display. See [ADR-004](../adr/0004-gedcom-libraries.md).

---

## User Input

The `DateInput` component accepts the following formats, case-insensitive:

| What the user types | Meaning               |
| ------------------- | --------------------- |
| `15 JAN 1845`       | Exact date            |
| `JAN 1845`          | Month and year only   |
| `1845`              | Year only             |
| `1845-01-15`        | ISO format            |
| `15/01/1845`        | French notation       |
| `ABT 1845`          | About 1845            |
| `CAL 1845`          | Calculated to be 1845 |
| `EST 1845`          | Estimated 1845        |
| `BEF 1845`          | Before 1845           |
| `AFT 1845`          | After 1845            |
| `BET 1840 AND 1845` | Between 1840 and 1845 |
| `FROM 1840 TO 1845` | From 1840 to 1845     |

---

## Database Storage

Each date is stored as two columns in the `events` table:

| Column          | Type   | Content                              | Example           |
| --------------- | ------ | ------------------------------------ | ----------------- |
| `date_original` | `TEXT` | Exact text entered by the user       | `ABT 15 JAN 1845` |
| `date_sort`     | `TEXT` | ISO string for chronological sorting | `1845-01-15`      |

- `date_original` is always preserved as-is. **This is the source of truth.**
- `date_sort` is derived from `date_original` at creation/update time.
- Missing month or day defaults to `01` in the sort date.
- Ranges sort on their start date.

---

## UI Display

Display is locale-aware (English by default, French when the app locale is `fr`). Conventions:

- Three formats by context — **short** for tables and compact spaces (`~15/01/1845`), **medium** by default (`about 15 Jan 1845`), **long** for detail views and headers (`about January 15, 1845`).
- `~` marks an approximate date or age (`~1845-1920`, `~75 years`).
- `?` marks an unknown component in a lifespan (`?-1920`).
- A trailing dash means still living (`1845-`).
- Known birth and death render as `1845-1920`; an exact age as `75 years`.

---

## Best Practices for Data Entry

1. **Use modifiers** — prefer `ABT 1845` over guessing an exact date.
2. **Be precise** — use `BEF 1845` rather than `ABT 1844`.
3. **Use intervals for uncertainty** — `BET 1840 AND 1850` when you cannot narrow it down.
4. **Cite calculated dates** — a `CAL` date should have a source citation explaining the calculation.

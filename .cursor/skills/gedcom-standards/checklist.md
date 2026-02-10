# GEDCOM Standards Review Checklist

Use this checklist when reviewing GEDCOM-related code or documentation.

## General

- [ ] GEDCOM version is 5.5.1 only
- [ ] Parsing done via `gedcom-parser` (no custom parsing)
- [ ] Date parsing done via `gedcom-date` (no custom date logic)
- [ ] All user-facing strings use i18n, never hardcoded

## Import

- [ ] Two-phase import: individuals first, then families
- [ ] `xrefToId` map used for XREF-to-DB-ID correspondence
- [ ] Place caching (`placeCache`) to avoid duplicate places
- [ ] Entire import wrapped in `BEGIN TRANSACTION` / `COMMIT`
- [ ] `ROLLBACK` executed on error before rethrowing
- [ ] Per-record errors collected without aborting (format: `INDI I1: ...`)
- [ ] Unsupported tags silently ignored (OBJE, BLOB, ASSO, ALIA, ANCI, DESI, SUBM, SUBN)
- [ ] Accepted file extensions: `.ged`, `.gedcom`

## Export

- [ ] Fresh sequential XREFs generated (`I1`, `I2`, `F1`, `F2`, ...)
- [ ] Encoding is UTF-8
- [ ] CONC/CONT handled by `gedcom-parser`, not manually
- [ ] Privacy option (`includePrivate`) to exclude living individuals
- [ ] Export file extension: `.ged`

## Entity Mapping

- [ ] Gender values: `M`, `F`, or `U` only
- [ ] Family member roles: `husband`, `wife`, `child` only
- [ ] Name tags mapped correctly (GIVN, SURN, NPFX, NSFX, NICK, TYPE, SPFX)
- [ ] SPFX merged into surname field

## Event Types

- [ ] System types: non-null `tag`, display via i18n, export tag directly
- [ ] Custom types: `tag` is null, use `custom_name`; export as `1 EVEN` + `2 TYPE {custom_name}`
- [ ] Event tags match the documented GEDCOM 5.5.1 tag list

## Dates

- [ ] `date_original` stores raw GEDCOM string (never modified)
- [ ] `date_sort` generated via `toSortDate(parse(dateOriginal))`
- [ ] Missing month/day defaults to `01` in sort date
- [ ] Ranges use start date for sorting

## Validation

- [ ] Pre-import validation uses `validate()` from `gedcom-parser`
- [ ] Invalid files produce clear error message
- [ ] Validation reports individual and family counts

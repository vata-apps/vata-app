# GEDCOM 5.5.1 Mapping

## Overview

This document describes the correspondence between GEDCOM 5.5.1 structures and the Vata data model.

**Note**: GEDCOM parsing and serialization are handled by the in-app module `@vata-apps/gedcom-parser`. This document covers the mapping between GEDCOM structures and the Vata database schema. See [ADR-004](../decisions/adr-004-gedcom-libraries.md).

## Main Records

### INDI (Individual)

```gedcom
0 @I1@ INDI
1 NAME Jean-Pierre /DUPONT/
2 GIVN Jean-Pierre
2 SURN DUPONT
2 NPFX Dr.
2 NSFX Jr.
2 NICK Pierrot
2 TYPE married
1 SEX M
1 BIRT
2 DATE 15 JAN 1845
2 PLAC Montreal, Quebec, Canada
1 DEAT
2 DATE 3 MAR 1920
2 PLAC Quebec, Quebec, Canada
1 FAMC @F1@
1 FAMS @F2@
```

**Mapping:**

| GEDCOM     | Table          | Field           | Notes                          |
| ---------- | -------------- | --------------- | ------------------------------ |
| @I1@       | -              | (internal xref) | Not stored, converted to ID    |
| NAME       | names          | -               | Creates a name record          |
| NAME value | names          | (parsed)        | Format: Given /Surname/ Suffix |
| GIVN       | names          | given_names     |                                |
| SURN       | names          | surname         |                                |
| NPFX       | names          | prefix          |                                |
| NSFX       | names          | suffix          |                                |
| NICK       | names          | nickname        |                                |
| TYPE       | names          | type            | Mapped to NameType             |
| SEX        | individuals    | gender          | M, F, U                        |
| BIRT       | events         | -               | event_type_id = BIRT           |
| DEAT       | events         | -               | event_type_id = DEAT           |
| DATE       | events         | date_original   | Original text                  |
| PLAC       | places, events | place_id        | Creates place if needed        |
| FAMC       | family_members | -               | role = 'child'                 |
| FAMS       | family_members | -               | role = 'husband' or 'wife'     |

### FAM (Family)

```gedcom
0 @F1@ FAM
1 HUSB @I2@
1 WIFE @I3@
1 CHIL @I1@
1 CHIL @I4@
1 MARR
2 DATE 3 JUN 1870
2 PLAC Montreal, Quebec
```

**Mapping:**

| GEDCOM | Table          | Field                         | Notes                                  |
| ------ | -------------- | ----------------------------- | -------------------------------------- |
| @F1@   | -              | (internal xref)               | Not stored                             |
| HUSB   | family_members | individual_id, role='husband' |                                        |
| WIFE   | family_members | individual_id, role='wife'    |                                        |
| CHIL   | family_members | individual_id, role='child'   | sort_order incremented                 |
| MARR   | events         | -                             | event_type_id = MARR, linked to family |

### SOUR (Source)

```gedcom
0 @S1@ SOUR
1 TITL Parish Register Notre-Dame de Montreal
1 AUTH Notre-Dame Parish
1 PUBL BAnQ
1 REPO @R1@
2 CALN CE601-S51
```

**Mapping:**

| GEDCOM | Table   | Field           |
| ------ | ------- | --------------- |
| @S1@   | -       | (internal xref) |
| TITL   | sources | title           |
| AUTH   | sources | author          |
| PUBL   | sources | publisher       |
| REPO   | sources | repository_id   |
| CALN   | sources | call_number     |

### REPO (Repository)

```gedcom
0 @R1@ REPO
1 NAME BAnQ Montreal
1 ADDR 535 avenue Viger Est
2 CITY Montreal
2 STAE Quebec
2 POST H2L 2P3
2 CTRY Canada
1 PHON 514-873-1100
1 EMAIL info@banq.qc.ca
1 WWW www.banq.qc.ca
```

**Mapping:**

| GEDCOM | Table        | Field           |
| ------ | ------------ | --------------- |
| @R1@   | -            | (internal xref) |
| NAME   | repositories | name            |
| ADDR   | repositories | address         |
| CITY   | repositories | city            |
| CTRY   | repositories | country         |
| PHON   | repositories | phone           |
| EMAIL  | repositories | email           |
| WWW    | repositories | website         |

---

## Event types (system vs custom)

- **System event types**: have a non-null `event_types.tag` (GEDCOM code). Display name is resolved via i18n. On export, the tag is used directly (e.g. `1 BIRT`).
- **Custom event types**: `event_types.tag` is null, `event_types.custom_name` holds the display name. On export, use `1 EVEN` and `2 TYPE {custom_name}`.

## Individual Event Tags

| GEDCOM Tag | Name                   | event_types.tag |
| ---------- | ---------------------- | --------------- |
| BIRT       | Birth                  | BIRT            |
| CHR        | Christening            | CHR             |
| DEAT       | Death                  | DEAT            |
| BURI       | Burial                 | BURI            |
| CREM       | Cremation              | CREM            |
| ADOP       | Adoption               | ADOP            |
| BAPM       | Adult Baptism          | BAPM            |
| BARM       | Bar Mitzvah            | BARM            |
| BASM       | Bas Mitzvah            | BASM            |
| CONF       | Confirmation           | CONF            |
| FCOM       | First Communion        | FCOM            |
| ORDN       | Ordination             | ORDN            |
| NATU       | Naturalization         | NATU            |
| EMIG       | Emigration             | EMIG            |
| IMMI       | Immigration            | IMMI            |
| CENS       | Census                 | CENS            |
| PROB       | Probate                | PROB            |
| WILL       | Will                   | WILL            |
| GRAD       | Graduation             | GRAD            |
| RETI       | Retirement             | RETI            |
| EVEN       | Generic Event          | EVEN            |
| CAST       | Caste                  | CAST            |
| DSCR       | Physical Description   | DSCR            |
| EDUC       | Education              | EDUC            |
| IDNO       | Identification Number  | IDNO            |
| NATI       | Nationality            | NATI            |
| NCHI       | Number of Children     | NCHI            |
| NMR        | Number of Marriages    | NMR             |
| OCCU       | Occupation             | OCCU            |
| PROP       | Property               | PROP            |
| RELI       | Religion               | RELI            |
| RESI       | Residence              | RESI            |
| SSN        | Social Security Number | SSN             |
| TITL       | Title                  | TITL            |

## Family Event Tags

| GEDCOM Tag | Name                | event_types.tag |
| ---------- | ------------------- | --------------- |
| ANUL       | Annulment           | ANUL            |
| CENS       | Census              | CENS            |
| DIV        | Divorce             | DIV             |
| DIVF       | Divorce Filed       | DIVF            |
| ENGA       | Engagement          | ENGA            |
| MARB       | Marriage Banns      | MARB            |
| MARC       | Marriage Contract   | MARC            |
| MARL       | Marriage License    | MARL            |
| MARR       | Marriage            | MARR            |
| MARS       | Marriage Settlement | MARS            |
| EVEN       | Generic Event       | EVEN (+ 2 TYPE for custom types) |

---

## Place types

Place types (`place_types` table, optional `places.place_type_id`) are not part of GEDCOM 5.5.1. They are application-specific (e.g. city, country, cemetery). Export/import do not map them to GEDCOM.

---

## Date Formats

**Note**: Date parsing and formatting are handled by the in-app module `@vata-apps/gedcom-date`. This section describes only how dates are stored in the Vata database.

Dates are stored in the `events` table as:

- `date_original`: The original GEDCOM date string (e.g., `"ABT 15 JAN 1845"`)
- `date_sort`: ISO string for chronological sorting (e.g., `"1845-01-15"`)

See [Date Formats](./date-formats.md) for details on supported formats and storage.

---

## Name Format

**Note**: Name parsing is handled by the in-app module `@vata-apps/gedcom-parser`. This section describes only how names are stored in the Vata database.

GEDCOM names follow the format `Given Names /Surname/ Suffix` and are parsed into the `names` table with the following mapping:

| GEDCOM Tag | Vata Field  | Notes                                           |
| ---------- | ----------- | ----------------------------------------------- |
| GIVN       | given_names | Parsed from NAME value or explicit GIVN tag     |
| SURN       | surname     | Parsed from NAME value or explicit SURN tag     |
| NPFX       | prefix      | Name prefix (e.g., "Dr.", "Mr.")                |
| NSFX       | suffix      | Name suffix (e.g., "Jr.", "III")                |
| NICK       | nickname    | Nickname                                        |
| TYPE       | type        | Name type: "birth", "married", "aka", etc.      |
| SPFX       | surname     | Surname prefix (e.g., "de") merged into surname |

See the `@vata-apps/gedcom-parser` module for name parsing details.

---

## Links Between Records

### XREF References

GEDCOM references use the format `@X123@` where X is the type:

- I = Individual
- F = Family
- S = Source
- R = Repository
- N = Note

### Correspondence Table on Import

During import, a `xrefToId` Map maintains the correspondence (values are app display IDs, e.g. from `formatEntityId`):

```typescript
xrefToId.set("I1", "I-0042"); // GEDCOM @I1@ → app id I-0042
xrefToId.set("F1", "F-0015"); // GEDCOM @F1@ → app id F-0015
```

### On Export

On export, the reverse correspondence is created (keys are app display IDs):

```typescript
idToXref.set("I-0042", "I1"); // app id I-0042 → GEDCOM @I1@
```

---

## Special Characters

**Note**: Character encoding and line continuation (CONC/CONT) are handled by the in-app module `@vata-apps/gedcom-parser`.

### Encoding

Vata always exports GEDCOM files in UTF-8. The in-app module handles encoding detection and conversion during import.

### Long Lines

GEDCOM limits lines to 255 characters. Long lines are automatically wrapped using CONC/CONT by `@vata-apps/gedcom-parser` during serialization.

---

## Unsupported Tags

The following tags are ignored on import (may be added later):

| Tag  | Reason                            |
| ---- | --------------------------------- |
| OBJE | Media — files managed outside GEDCOM import/export |
| BLOB | Obsolete binary                   |
| ASSO | Complex associations              |
| ALIA | Alias - use NAME instead          |
| ANCI | Genealogical interest             |
| DESI | Genealogical interest             |
| SUBM | Submitter - not relevant locally  |
| SUBN | Submission - not relevant locally |

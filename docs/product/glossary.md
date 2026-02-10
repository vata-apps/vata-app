# Glossary

## Genealogical Domain

**CONC / CONT** — GEDCOM continuation tags. CONC concatenates text on the same logical line; CONT adds a line break. Used for long text values.

**Event** — A life milestone associated with an individual (birth, death, christening, burial) or a family (marriage, divorce). Has an optional date and place.

**Family** — A GEDCOM record representing a union: optional husband, optional wife, and zero or more children. Identified by the FAM tag.

**GEDCOM** — Genealogical Data Communication. A text-based file format (.ged) for exchanging genealogical data between software. Vata supports version 5.5.1.

**Individual** — A person in a genealogical tree. Identified by the INDI tag in GEDCOM. Can have multiple names, events, and family links.

**Name** — A person's name record. Individuals can have multiple names (birth name, married name, adopted name). In GEDCOM, the surname is delimited by slashes: `Given /Surname/ Suffix`.

**Pedigree** — The type of parent-child relationship: biological (birth), adopted, foster, or sealing.

**Place** — A location associated with an event. Stored as a full hierarchical string (e.g., "Montreal, Quebec, Canada").

**Repository** — An institution where sources are held (archive, library, church). Linked to sources.

**Source** — Documentary evidence supporting a genealogical fact: a birth certificate, a census record, a parish register. Sources can have citations linking them to specific entities.

**XREF** — Cross-reference identifier in GEDCOM. A unique tag (e.g., `@I1@`, `@F3@`) that links records together within a file.

## GEDCOM Tags (Common)

| Tag    | Meaning          |
| ------ | ---------------- |
| INDI   | Individual       |
| FAM    | Family           |
| SOUR   | Source           |
| REPO   | Repository       |
| NOTE   | Note             |
| BIRT   | Birth event      |
| DEAT   | Death event      |
| MARR   | Marriage event   |
| DIV    | Divorce event    |
| CHR    | Christening      |
| BURI   | Burial           |
| NAME   | Name             |
| SEX    | Gender           |
| DATE   | Date             |
| PLAC   | Place            |

## Technical Terms

**ADR** — Architecture Decision Record. A short document capturing a significant technical decision: context, decision, alternatives, and consequences.

**IPC** — Inter-Process Communication. The bridge between the frontend (WebView) and the native backend (Rust) in Tauri.

**JTBD** — Job to be Done. A product framework describing what the user is trying to accomplish, independent of the solution.

**Local-first** — A design philosophy where the application works entirely offline, with all data stored on the user's machine. No server or internet connection required.

**MVP** — Minimum Viable Product. A version of the product with just enough features to deliver a specific job to be done.

**Round-trip** — The ability to export data (e.g., to GEDCOM) and re-import it without loss. A quality measure for data fidelity.

**SQLite** — A lightweight, file-based relational database. Vata uses one SQLite file for system metadata and one file per tree.

**Tauri** — A framework for building desktop applications with a web frontend and a Rust backend. Uses the operating system's native WebView instead of bundling Chromium.

**WAL** — Write-Ahead Logging. A SQLite journal mode that improves write performance and concurrency by writing changes to a separate log before applying them to the main database file.

**WebView** — The native browser engine used by Tauri to render the UI (WebKit on macOS/Linux, WebView2 on Windows). Unlike Electron, no Chromium is bundled.

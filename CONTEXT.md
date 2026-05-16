# Vata — Genealogy Domain

The language of the genealogical data Vata manages: the entities that make up a family tree and how they relate. Vata is a local-first desktop editor, GEDCOM 5.5.1 compatible.

## Language

**Tree**:
A single family tree — the complete genealogical dataset for one research project, stored as one database file.
_Avoid_: Project, File, Database

**Individual**:
A person in a tree. **Individual** names the concept in code, DB schema, types, and GEDCOM (`INDI`); the user-facing UI label for the same concept is **Person** / **People**.
_Avoid_: Profile, Record

**Name**:
A naming record for an individual; an individual can hold several (birth, married, adopted), one flagged as primary.
_Avoid_: Label

**Family**:
The union record linking an optional husband, an optional wife, and zero or more children — it exists independently of any ceremony.
_Avoid_: Marriage, Couple, Union, Household

**Pedigree**:
The nature of a parent–child link within a family: biological, adopted, foster, or sealing.
_Avoid_: Lineage, Relationship type

**Event**:
A dated, placed occurrence recorded in a tree — birth, death, burial, marriage, divorce, census.
_Avoid_: Fact, Milestone, Attribute

**Place**:
A hierarchical location attached to an event.
_Avoid_: Location, Address

**Source**:
A piece of documentary evidence supporting a genealogical fact (a parish register, a census, a certificate).
_Avoid_: Document, Record

**Citation**:
A specific reference into a Source — a page, a **Quality** assessment, a consultation date, an optional transcription — reusable to support several facts across the tree.
_Avoid_: Reference, Source citation

**Repository**:
An institution that holds sources (an archive, a library, a church).
_Avoid_: Archive, Library

**Media**:
A digitized file attached to genealogical records — a scanned document, a photograph, a certificate image.
_Avoid_: File, Attachment, Object

**Quality**:
The assessment of how reliable a piece of evidence is — primary, secondary, questionable, or unreliable.
_Avoid_: Confidence, Reliability, Accuracy

**GEDCOM**:
The text-based interchange format (`.ged`, version 5.5.1) Vata imports from and exports to.
_Avoid_: Export file, Backup

## Relationships

- A **Tree** contains many **Individuals**, **Families**, **Events**, **Places**, **Sources**, and **Repositories**.
- An **Individual** has one or more **Names** (exactly one is primary).
- A **Family** links an optional husband **Individual**, an optional wife **Individual**, and zero or more child **Individuals**.
- A **Pedigree** qualifies each parent–child link inside a **Family**.
- An **Event** has an optional **Place** and one or more participants — each participant is an **Individual** or a **Family** in a role (principal, witness, officiant, …).
- A **Citation** belongs to exactly one **Source**.
- A **Citation** can be attached to many entities — an **Individual**, a **Family**, an **Event**, a **Place**, or a **Name**. A **Source** is never attached directly; it is reached only through a **Citation**.
- A **Repository** holds zero or more **Sources**.
- A **Media** is attached to one or more entities — most often a **Source**, but also directly to an **Individual** (a portrait) or an **Event**.

## Example dialogue

> **Dev:** "When two people marry, do we create a Family or a marriage Event?"
> **Domain expert:** "Both, and they stay distinct. The **Family** is the union record — it exists even with no recorded ceremony. The marriage is an **Event** attached to that **Family**, carrying the date and **Place**."
> **Dev:** "And if I attach a parish register that proves the marriage?"
> **Domain expert:** "The register is a **Source**. It doesn't hang off the **Event** directly — a **Citation** does: page 12 of that register, and that same **Citation** can back the children's birth records too. The register itself lives in a **Repository**, the archive that holds it."

## Flagged ambiguities

- "Marriage" was used for both the **Family** union record and the marriage **Event** — resolved: the **Family** is the union, the **Event** is the dated ceremony.
- "Source" vs "Citation" — the **Source** is the document itself; a **Citation** is a specific reference into it (page, quality). Distinct records: one **Source** has many **Citations**.
- "Person" / "Individual" — the same concept, named per layer by deliberate decision: **Individual** in code, DB schema, types, and GEDCOM (`INDI`, the `individuals` table); **Person** / **People** on user-facing UI surfaces. A button reading "People" above an `individuals` table is correct, not drift.

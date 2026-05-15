# Vata — Genealogy Domain

The language of the genealogical data Vata manages: the entities that make up a family tree and how they relate. Vata is a local-first desktop editor, GEDCOM 5.5.1 compatible.

## Language

**Tree**:
A single family tree — the complete genealogical dataset for one research project, stored as one database file.
_Avoid_: Project, File, Database

**Individual**:
A person in a tree.
_Avoid_: Person, Profile, Record

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
A dated, placed milestone attached to an individual (birth, death, burial) or a family (marriage, divorce).
_Avoid_: Fact, Milestone, Attribute

**Place**:
A hierarchical location attached to an event.
_Avoid_: Location, Address

**Source**:
A piece of documentary evidence supporting a genealogical fact (a parish register, a census, a certificate).
_Avoid_: Citation, Document, Reference

**Repository**:
An institution that holds sources (an archive, a library, a church).
_Avoid_: Archive, Library

**GEDCOM**:
The text-based interchange format (`.ged`, version 5.5.1) Vata imports from and exports to.
_Avoid_: Export file, Backup

## Relationships

- A **Tree** contains many **Individuals**, **Families**, **Events**, **Places**, **Sources**, and **Repositories**.
- An **Individual** has one or more **Names** (exactly one is primary).
- A **Family** links an optional husband **Individual**, an optional wife **Individual**, and zero or more child **Individuals**.
- A **Pedigree** qualifies each parent–child link inside a **Family**.
- An **Event** belongs to exactly one **Individual** or one **Family**, with an optional **Place**.
- A citation links a **Source** to an **Individual**, **Family**, or **Event** — the **Source** is never attached directly.
- A **Repository** holds zero or more **Sources**.

## Example dialogue

> **Dev:** "When two people marry, do we create a Family or a marriage Event?"
> **Domain expert:** "Both, and they stay distinct. The **Family** is the union record — it exists even with no recorded ceremony. The marriage is an **Event** attached to that **Family**, carrying the date and **Place**."
> **Dev:** "And if I attach a parish register that proves the marriage?"
> **Domain expert:** "The register is a **Source**. It doesn't hang off the **Event** directly — a citation links the **Source** to the **Event**. The register itself lives in a **Repository**, the archive that holds it."

## Flagged ambiguities

- "Marriage" was used for both the **Family** union record and the marriage **Event** — resolved: the **Family** is the union, the **Event** is the dated ceremony.
- "Source" vs citation — the **Source** is the document itself; a citation is the link from a **Source** to an entity. Keep them separate.
- "Person" / "Individual" — canonical term is **Individual**, matching the GEDCOM `INDI` record and the `individuals` table.

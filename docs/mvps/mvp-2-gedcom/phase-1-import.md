# Phase 1: Import

## Objective

Use the in-app module `@vata-apps/gedcom-parser` and implement GEDCOM import functionality that maps GEDCOM structures to the Vata database schema. No separate package to install; the module lives in `src/gedcom-parser/` (see [ADR-004](../../decisions/adr-004-gedcom-libraries.md)).

## Step 1.1: Use gedcom-parser (in-app)

The in-app module `@vata-apps/gedcom-parser` provides:

- `parseDocument()` - Parse GEDCOM text into typed `GedcomDocument`
- `serialize()` - Serialize `GedcomDocument` back to GEDCOM text
- `validate()` - Validate GEDCOM structure
- Typed interfaces: `GedcomIndividual`, `GedcomFamily`, `GedcomName`, `GedcomEvent`, etc.

Ensure `tsconfig.json` has path alias: `"@vata-apps/gedcom-parser": ["./src/gedcom-parser"]`. For dates during import, use `@vata-apps/gedcom-date`.

---

## Step 1.2: Import Data

### src/lib/gedcom/importer.ts

```typescript
import {
  parseDocument,
  type GedcomDocument,
  type GedcomIndividual,
  type GedcomFamily,
} from "@vata-apps/gedcom-parser";
import { parse, toSortDate } from "@vata-apps/gedcom-date";
import { getTreeDb } from "$/db/connection";
import type { Gender } from "$/types/database";
import { formatEntityId, parseEntityId } from "$/lib/entityId";

interface ImportStats {
  individuals: number;
  families: number;
  places: number;
  errors: string[];
}

interface ImportContext {
  db: any;
  xrefToId: Map<string, string>;
  placeCache: Map<string, string>;
}

/**
 * Import GEDCOM file into current tree
 */
export async function importGedcom(content: string): Promise<ImportStats> {
  // Parse GEDCOM using in-app module @vata-apps/gedcom-parser
  const document = parseDocument(content);
  const db = await getTreeDb();

  const stats: ImportStats = {
    individuals: 0,
    families: 0,
    places: 0,
    errors: [],
  };

  const context: ImportContext = {
    db,
    xrefToId: new Map(),
    placeCache: new Map(),
  };

  await db.execute("BEGIN TRANSACTION");

  try {
    // Phase 1: Import individuals (without family links)
    for (const individual of document.individuals) {
      try {
        await importIndividual(individual, context);
        stats.individuals++;
      } catch (e) {
        stats.errors.push(`INDI ${individual.xref}: ${e.message}`);
      }
    }

    // Phase 2: Import families and link members
    for (const family of document.families) {
      try {
        await importFamily(family, context);
        stats.families++;
      } catch (e) {
        stats.errors.push(`FAM ${family.xref}: ${e.message}`);
      }
    }

    // Note: Source/repository import is deferred to MVP4

    await db.execute("COMMIT");
  } catch (e) {
    await db.execute("ROLLBACK");
    throw e;
  }

  return stats;
}

/**
 * Import individual record
 */
async function importIndividual(
  individual: GedcomIndividual,
  ctx: ImportContext,
): Promise<void> {
  const { db, xrefToId } = ctx;

  // Parse gender
  const gender: Gender =
    individual.gender === "M" ? "M" : individual.gender === "F" ? "F" : "U";

  // Create individual
  const result = await db.execute(
    "INSERT INTO individuals (gender, is_living) VALUES ($1, $2)",
    [gender, 1],
  );
  const individualId = formatEntityId("I", result.lastInsertId);
  xrefToId.set(individual.xref, individualId);

  // Import names
  let isPrimary = true;
  for (const name of individual.names) {
    await importName(name, individualId, isPrimary, ctx);
    isPrimary = false;
  }

  // Import events
  for (const event of individual.events) {
    await importIndividualEvent(event, individualId, ctx);
  }
}

/**
 * Import name from parsed GedcomName
 */
async function importName(
  name: GedcomName,
  individualId: string,
  isPrimary: boolean,
  ctx: ImportContext,
): Promise<void> {
  const { db } = ctx;

  await db.execute(
    `INSERT INTO names (individual_id, type, prefix, given_names, surname, suffix, nickname, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      parseEntityId(individualId),
      mapNameType(name.type),
      name.prefix || null,
      name.givenNames || null,
      name.surname || null,
      name.suffix || null,
      name.nickname || null,
      isPrimary ? 1 : 0,
    ],
  );
}

/**
 * Import individual event
 */
async function importIndividualEvent(
  event: GedcomEvent,
  individualId: string,
  ctx: ImportContext,
): Promise<void> {
  const { db } = ctx;

  // Get event type ID
  const typeRows = await db.select<{ id: number }[]>(
    "SELECT id FROM event_types WHERE tag = $1",
    [event.tag],
  );
  if (!typeRows[0]) return;
  const eventTypeId = typeRows[0].id;

  // Parse date using @vata-apps/gedcom-date
  const dateSort = event.date ? toSortDate(parse(event.date)) : null;

  // Get or create place
  const placeId = event.place ? await getOrCreatePlace(event.place, ctx) : null;

  // Description (for OCCU, etc.)
  const description = event.description || null;

  // Create event
  const result = await db.execute(
    `INSERT INTO events (event_type_id, date_original, date_sort, place_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      eventTypeId,
      event.date || null,
      dateSort,
      placeId ? parseEntityId(placeId) : null,
      description,
    ],
  );
  const eventId = result.lastInsertId;

  // Link to individual
  await db.execute(
    `INSERT INTO event_participants (event_id, individual_id, role)
     VALUES ($1, $2, 'principal')`,
    [eventId, parseEntityId(individualId)],
  );
}

/**
 * Import family record
 */
async function importFamily(
  family: GedcomFamily,
  ctx: ImportContext,
): Promise<void> {
  const { db, xrefToId } = ctx;

  // Create family
  const result = await db.execute("INSERT INTO families DEFAULT VALUES");
  const familyId = formatEntityId("F", result.lastInsertId);
  xrefToId.set(family.xref, familyId);

  // Link husband
  if (family.husbandRef && xrefToId.has(family.husbandRef)) {
    await db.execute(
      `INSERT INTO family_members (family_id, individual_id, role)
       VALUES ($1, $2, 'husband')`,
      [parseEntityId(familyId), parseEntityId(xrefToId.get(family.husbandRef)!)],
    );
  }

  // Link wife
  if (family.wifeRef && xrefToId.has(family.wifeRef)) {
    await db.execute(
      `INSERT INTO family_members (family_id, individual_id, role)
       VALUES ($1, $2, 'wife')`,
      [parseEntityId(familyId), parseEntityId(xrefToId.get(family.wifeRef)!)],
    );
  }

  // Link children
  let sortOrder = 0;
  for (const childXref of family.childRefs) {
    if (xrefToId.has(childXref)) {
      await db.execute(
        `INSERT INTO family_members (family_id, individual_id, role, sort_order)
         VALUES ($1, $2, 'child', $3)`,
        [parseEntityId(familyId), parseEntityId(xrefToId.get(childXref)!), sortOrder++],
      );
    }
  }

  // Import family events
  for (const event of family.events) {
    await importFamilyEvent(event, familyId, ctx);
  }
}

/**
 * Get or create place
 */
async function getOrCreatePlace(
  fullName: string,
  ctx: ImportContext,
): Promise<string> {
  const { db, placeCache } = ctx;

  // Check cache
  if (placeCache.has(fullName)) {
    return placeCache.get(fullName)!;
  }

  // Check database
  const existing = await db.select<{ id: number }[]>(
    "SELECT id FROM places WHERE full_name = $1",
    [fullName],
  );
  if (existing[0]) {
    const id = formatEntityId("P", existing[0].id);
    placeCache.set(fullName, id);
    return id;
  }

  // Create new place
  const parts = fullName.split(",").map((p) => p.trim());
  const name = parts[0] || fullName;

  const result = await db.execute(
    "INSERT INTO places (name, full_name) VALUES ($1, $2)",
    [name, fullName],
  );
  const id = formatEntityId("P", result.lastInsertId);
  placeCache.set(fullName, id);
  return id;
}

function mapNameType(type?: string): string {
  if (!type) return "birth";
  const lower = type.toLowerCase();
  if (lower.includes("married") || lower.includes("marriage")) return "married";
  if (lower.includes("aka") || lower.includes("alias")) return "aka";
  if (lower.includes("immigrant")) return "immigrant";
  return "birth";
}
```

### Validation Criteria

- [ ] GEDCOM parsing works
- [ ] Individual import works
- [ ] Name import works
- [ ] Family import works
- [ ] Event import works
- [ ] Place import works
- [ ] Error handling works
- [ ] Transaction rollback on error works

---

## Phase 1 Deliverables

### Files Created

```
src/lib/gedcom/
└── importer.ts
```

### Final Checklist

- [ ] In-app module `@vata-apps/gedcom-parser` (and `@vata-apps/gedcom-date` for dates) available and path aliases configured
- [ ] Import function implemented
- [ ] All entity types import correctly
- [ ] Error handling implemented
- [ ] Transaction management works

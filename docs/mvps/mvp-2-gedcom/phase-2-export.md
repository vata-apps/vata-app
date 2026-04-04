# Phase 2: Export

## Objective

Implement GEDCOM export functionality and create GedcomManager to orchestrate import/export operations.

## Step 2.1: Export GEDCOM

### src/lib/gedcom/exporter.ts

```typescript
import {
  serialize,
  type GedcomDocument,
  type GedcomIndividual,
  type GedcomFamily,
  type GedcomName,
  type GedcomEvent,
} from "@vata-apps/gedcom-parser";
import { getTreeDb } from "$/db/connection";
import { formatEntityId, parseEntityId } from "$/lib/entityId";
import { getAllIndividuals } from "$/db/trees/individuals";
import { getNamesByIndividualId } from "$/db/trees/names";
import { getAllFamilies, getFamilyMembers } from "$/db/trees/families";
import {
  getEventsByIndividualId,
  getEventsByFamilyId,
} from "$/db/trees/events";

interface ExportOptions {
  treeName: string;
  includePrivate?: boolean; // Include living individuals
}

/**
 * Export tree to GEDCOM format
 */
export async function exportGedcom(options: ExportOptions): Promise<string> {
  const db = await getTreeDb();

  // ID mappings
  const individualXrefs = new Map<string, string>();
  const familyXrefs = new Map<string, string>();

  // Build GedcomDocument structure
  // Note: sources and repositories are empty arrays (MVP4)
  const document: GedcomDocument = {
    header: {
      sourceApp: "Vata",
      sourceVersion: "0.1.0",
      gedcomVersion: "5.5.1",
      encoding: "UTF-8",
    },
    individuals: [],
    families: [],
    sources: [],
    repositories: [],
    notes: [],
  };

  // Build individuals
  const individuals = await getAllIndividuals();
  let xrefCounter = 1;

  for (const individual of individuals) {
    // Skip living individuals if not including private
    if (!options.includePrivate && individual.isLiving) {
      continue;
    }

    const xref = `I${xrefCounter++}`;
    individualXrefs.set(individual.id, xref);

    // Convert names
    const names = await getNamesByIndividualId(individual.id);
    const gedcomNames: GedcomName[] = names.map((name) => ({
      givenNames: name.givenNames || undefined,
      surname: name.surname || undefined,
      prefix: name.prefix || undefined,
      suffix: name.suffix || undefined,
      nickname: name.nickname || undefined,
      type: name.type !== "birth" ? name.type : undefined,
    }));

    // Convert events (system types: use tag; custom types: tag is null, export as EVEN + 2 TYPE customName)
    const events = await getEventsByIndividualId(individual.id);
    const gedcomEvents: GedcomEvent[] = events.map((event) => ({
      tag: event.eventType.tag ?? "EVEN",
      type: event.eventType.tag == null ? (event.eventType.customName ?? undefined) : undefined,
      date: event.dateOriginal || undefined,
      place: event.place?.fullName || undefined,
      description: event.description || undefined,
      notes: [],
      sources: [],
    }));

    // Get family references
    const spouseFamilies = await db.select<{ family_id: number }[]>(
      `SELECT family_id FROM family_members 
       WHERE individual_id = $1 AND role IN ('husband', 'wife')`,
      [parseEntityId(individual.id)],
    );
    const childFamilies = await db.select<{ family_id: number }[]>(
      `SELECT family_id FROM family_members 
       WHERE individual_id = $1 AND role = 'child'`,
      [parseEntityId(individual.id)],
    );

    const familySpouseRefs = spouseFamilies
      .map((sf) => familyXrefs.get(formatEntityId("F", sf.family_id)))
      .filter((ref): ref is string => ref !== undefined);

    const familyChildRefs = childFamilies
      .map((cf) => familyXrefs.get(formatEntityId("F", cf.family_id)))
      .filter((ref): ref is string => ref !== undefined);

    document.individuals.push({
      xref,
      names: gedcomNames,
      gender: individual.gender as "M" | "F" | "U",
      events: gedcomEvents,
      familyChildRefs,
      familySpouseRefs,
      notes: [],
      sources: [],
    });
  }

  // Build families
  const families = await getAllFamilies();
  xrefCounter = 1;

  for (const family of families) {
    const xref = `F${xrefCounter++}`;
    familyXrefs.set(family.id, xref);

    // Get members
    const members = await getFamilyMembers(family.id);
    const husbandRef = members.find((m) => m.role === "husband")?.individualId
      ? individualXrefs.get(
          members.find((m) => m.role === "husband")!.individualId,
        )
      : undefined;
    const wifeRef = members.find((m) => m.role === "wife")?.individualId
      ? individualXrefs.get(
          members.find((m) => m.role === "wife")!.individualId,
        )
      : undefined;
    const childRefs = members
      .filter((m) => m.role === "child")
      .map((m) => individualXrefs.get(m.individualId))
      .filter((ref): ref is string => ref !== undefined);

    // Convert events (system: tag; custom: EVEN + TYPE customName)
    const events = await getEventsByFamilyId(family.id);
    const gedcomEvents: GedcomEvent[] = events.map((event) => ({
      tag: event.eventType.tag ?? "EVEN",
      type: event.eventType.tag == null ? (event.eventType.customName ?? undefined) : undefined,
      date: event.dateOriginal || undefined,
      place: event.place?.fullName || undefined,
      description: event.description || undefined,
      notes: [],
      sources: [],
    }));

    document.families.push({
      xref,
      husbandRef,
      wifeRef,
      childRefs,
      events: gedcomEvents,
      notes: [],
      sources: [],
    });
  }

  // Serialize using in-app module @vata-apps/gedcom-parser
  return serialize(document, {
    sourceApp: "Vata",
    sourceVersion: "0.1.0",
  });
}
```

### Validation Criteria

- [ ] Export produces valid GEDCOM
- [ ] All individuals exported
- [ ] All families exported
- [ ] Events exported correctly
- [ ] Places exported correctly
- [ ] Privacy option works

---

## Step 2.2: GEDCOM Manager

### src/managers/GedcomManager.ts

```typescript
import { importGedcom, ImportStats } from "$/lib/gedcom/importer";
import { exportGedcom } from "$/lib/gedcom/exporter";
import { TreeManager } from "./TreeManager";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";

export class GedcomManager {
  /**
   * Import GEDCOM file into a new tree
   */
  static async importFromFile(): Promise<{
    treeId: string;
    stats: ImportStats;
  } | null> {
    // Open file dialog
    const selected = await open({
      multiple: false,
      filters: [{ name: "GEDCOM", extensions: ["ged", "gedcom"] }],
    });

    if (!selected) return null;

    // Read file content
    const content = await readTextFile(selected as string);

    // Create new tree
    const filename =
      (selected as string)
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") || "imported";
    const treeId = await TreeManager.create({
      name: filename,
      description: "Imported from GEDCOM",
    });

    // Open the tree
    await TreeManager.open(treeId);

    // Import data
    const stats = await importGedcom(content);

    // Update tree stats
    await TreeManager.updateStats(treeId);

    return { treeId, stats };
  }

  /**
   * Export current tree to GEDCOM file
   */
  static async exportToFile(
    treeName: string,
    includePrivate: boolean = false,
  ): Promise<boolean> {
    // Generate GEDCOM content
    const content = await exportGedcom({
      treeName,
      includePrivate,
    });

    // Save file dialog (native OS dialog — in-app form flows use standalone form windows;
    // only the final "Save file" step uses the native save dialog)
    const savePath = await save({
      defaultPath: `${treeName}.ged`,
      filters: [{ name: "GEDCOM", extensions: ["ged"] }],
    });

    if (!savePath) return false;

    // Write file
    await writeTextFile(savePath, content);

    return true;
  }

  /**
   * Validate GEDCOM content without importing
   */
  static async validate(content: string): Promise<{
    valid: boolean;
    errors: string[];
    stats: { individuals: number; families: number };
  }> {
    // Use in-app module @vata-apps/gedcom-parser validation
    const { validate } = await import("@vata-apps/gedcom-parser");
    const result = validate(content);

    return {
      valid: result.valid,
      errors: result.errors?.map((e) => e.message) || [],
      stats: {
        individuals: result.stats?.individuals || 0,
        families: result.stats?.families || 0,
      },
    };
  }
}
```

### Validation Criteria

- [ ] Import from file works
- [ ] Export to file works
- [ ] Validation works
- [ ] File dialogs work correctly

---

## Phase 2 Deliverables

### Files Created

```
src/lib/gedcom/
└── exporter.ts
src/managers/
└── GedcomManager.ts
```

### Final Checklist

- [ ] Export function implemented
- [ ] GedcomManager created
- [ ] File operations work
- [ ] Validation implemented

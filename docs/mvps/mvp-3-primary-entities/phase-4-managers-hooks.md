# Phase 4: Managers & Hooks

## Objective

Implement business logic managers and React Query hooks to bridge the database layer with the UI.

## Step 4.1: TreeManager

### src/managers/TreeManager.ts

Orchestrate tree operations:

```typescript
import { createTree, openTreeDb, closeTreeDb, markTreeOpened } from "$/db/connection";
import { createTree as createTreeDb, updateTreeStats } from "$/db/system/trees";
import { countIndividuals, countFamilies } from "$/db/trees/individuals";
import { useAppStore } from "$/store/app-store";

export class TreeManager {
  /**
   * Create a new tree
   */
  static async create(data: {
    name: string;
    filename: string;
    description?: string;
  }): Promise<string> {
    // Create tree record in system.db
    const treeId = await createTreeDb(data);
    
    // Create tree database file
    await openTreeDb(data.filename);
    
    return treeId;
  }

  /**
   * Open a tree
   */
  static async open(treeId: string): Promise<void> {
    const tree = await getTreeById(treeId);
    if (!tree) throw new Error("Tree not found");
    
    await openTreeDb(tree.filename);
    await markTreeOpened(treeId);
    
    useAppStore.getState().setCurrentTree(treeId);
  }

  /**
   * Close current tree
   */
  static async close(): Promise<void> {
    await closeTreeDb();
    useAppStore.getState().setCurrentTree(null);
  }

  /**
   * Update tree statistics
   */
  static async updateStats(treeId: string): Promise<void> {
    const individualCount = await countIndividuals();
    const familyCount = await countFamilies();
    
    await updateTreeStats(treeId, {
      individualCount,
      familyCount,
    });
  }
}
```

---

## Step 4.2: IndividualManager

### src/managers/IndividualManager.ts

```typescript
import { createIndividual, getIndividualById, updateIndividual, deleteIndividual, getAllIndividuals } from "$/db/trees/individuals";
import { getNamesByIndividualId, createName } from "$/db/trees/names";
import { getEventsByIndividualId } from "$/db/trees/events";
import type { CreateIndividualInput, IndividualWithDetails } from "$/types/database";

export class IndividualManager {
  /**
   * Create individual with initial name
   */
  static async create(input: CreateIndividualInput & { name?: { givenNames?: string; surname?: string } }): Promise<string> {
    const db = await getTreeDb();
    await db.execute("BEGIN TRANSACTION");
    
    try {
      const individualId = await createIndividual(input);
      
      // Create initial name if provided
      if (input.name) {
        await createName({
          individualId,
          givenNames: input.name.givenNames,
          surname: input.name.surname,
          isPrimary: true,
        });
      }
      
      await db.execute("COMMIT");
      return individualId;
    } catch (e) {
      await db.execute("ROLLBACK");
      throw e;
    }
  }

  /**
   * Get individual with details
   */
  static async getById(id: string): Promise<IndividualWithDetails | null> {
    const individual = await getIndividualById(id);
    if (!individual) return null;

    const names = await getNamesByIndividualId(id);
    const events = await getEventsByIndividualId(id);
    
    const birthEvent = events.find(e => e.eventType.tag === "BIRT") || null;
    const deathEvent = events.find(e => e.eventType.tag === "DEAT") || null;

    return {
      ...individual,
      primaryName: names.find(n => n.isPrimary) || names[0] || null,
      names,
      birthEvent,
      deathEvent,
      citations: [],
    };
  }

  /**
   * Get all individuals
   */
  static async getAll(): Promise<IndividualWithDetails[]> {
    const individuals = await getAllIndividuals();
    return Promise.all(individuals.map(ind => this.getById(ind.id)));
  }

  /**
   * Update individual
   */
  static async update(id: string, input: UpdateIndividualInput): Promise<void> {
    return updateIndividual(id, input);
  }

  /**
   * Delete individual
   */
  static async delete(id: string): Promise<void> {
    return deleteIndividual(id);
  }
}
```

---

## Step 4.3: FamilyManager

### src/managers/FamilyManager.ts

Similar pattern for families:

- `create(familyData, husbandId?, wifeId?)`
- `getById(id)` - Returns family with members
- `addChild(familyId, individualId, pedigree?)`
- `removeChild(familyId, individualId)`

---

## Step 4.4: React Query Hooks

### src/hooks/useIndividuals.ts

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IndividualManager } from "$/managers/IndividualManager";
import type { CreateIndividualInput, UpdateIndividualInput } from "$/types/database";
import { queryKeys } from "$lib/query-keys";

export function useIndividuals() {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
  });
}

export function useIndividual(id: string) {
  return useQuery({
    queryKey: queryKeys.individual(id),
    queryFn: () => IndividualManager.getById(id),
    enabled: !!id,
  });
}

export function useCreateIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIndividualInput) => IndividualManager.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

export function useUpdateIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIndividualInput }) =>
      IndividualManager.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individual(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
    },
  });
}

export function useDeleteIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: IndividualManager.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.individuals });
      queryClient.invalidateQueries({ queryKey: queryKeys.families });
    },
  });
}
```

### Similar hooks for families, places, events

Create `useFamilies.ts`, `usePlaces.ts`, `useEvents.ts` following the same pattern.

---

## Phase 4 Deliverables

### Files Created

```
src/managers/
├── TreeManager.ts
├── IndividualManager.ts
└── FamilyManager.ts
src/hooks/
├── useIndividuals.ts
├── useFamilies.ts
├── usePlaces.ts
└── useEvents.ts
```

### Final Checklist

- [ ] TreeManager implemented
- [ ] IndividualManager implemented
- [ ] FamilyManager implemented
- [ ] React Query hooks implemented
- [ ] Cache invalidation works correctly
- [ ] Transactions used for multi-table operations

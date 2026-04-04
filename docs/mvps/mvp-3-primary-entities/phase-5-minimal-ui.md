# Phase 5: Minimal UI

## Objective

Create HTML-only UI pages for listing and viewing individuals and families. **No UI library in MVP3** — use HTML with minimal CSS.

## Step 5.1: Individual List Page

### src/pages/IndividualsPage.tsx

```typescript
import { useQuery } from '@tanstack/react-query';
import { useIndividuals } from '$/hooks/useIndividuals';
import { formatName } from '$/db/trees/names';

export function IndividualsPage() {
  const { data: individuals, isLoading } = useIndividuals();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Individuals</h1>
      <button style={{ marginBottom: '1rem' }}>New Individual</button>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {individuals?.map((individual) => {
          const formatted = formatName(individual.primaryName);
          
          return (
            <div key={individual.id} style={{
              border: '1px solid #e0e0e0',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              <h3>{formatted.full}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                {individual.gender} · {individual.isLiving ? 'Living' : 'Deceased'}
              </p>
              <button>View</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Step 5.2: Individual View Page

### src/pages/IndividualViewPage.tsx

```typescript
import { useParams } from '@tanstack/react-router';
import { useIndividual } from '$/hooks/useIndividuals';
import { formatName } from '$/db/trees/names';

export function IndividualViewPage() {
  const { individualId } = useParams({ from: '/tree/$treeId/individual/$individualId' });
  const { data: individual, isLoading } = useIndividual(individualId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!individual) {
    return <div>Individual not found</div>;
  }

  const formatted = formatName(individual.primaryName);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>{formatted.full}</h1>
        <p>{individual.gender} · {individual.isLiving ? 'Living' : 'Deceased'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Names</h2>
        <ul>
          {individual.names.map((name) => (
            <li key={name.id}>
              {formatName(name).full} {name.isPrimary && '(Primary)'}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Events</h2>
        <ul>
          {individual.birthEvent && (
            <li>Birth: {individual.birthEvent.dateOriginal || 'Unknown'}</li>
          )}
          {individual.deathEvent && (
            <li>Death: {individual.deathEvent.dateOriginal || 'Unknown'}</li>
          )}
        </ul>
      </div>

      <div>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    </div>
  );
}
```

---

## Step 5.3: Routes

### src/routes/tree/$treeId/individuals.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { IndividualsPage } from '$pages/IndividualsPage';

export const Route = createFileRoute('/tree/$treeId/individuals')({
  component: IndividualsPage,
});
```

### src/routes/tree/$treeId/individual/$individualId.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { IndividualViewPage } from '$pages/IndividualViewPage';

export const Route = createFileRoute('/tree/$treeId/individual/$individualId')({
  component: IndividualViewPage,
});
```

---

## Step 5.4: Family List and View

Create similar pages for families:

- `src/pages/FamiliesPage.tsx`
- `src/pages/FamilyViewPage.tsx`
- Routes: `/tree/$treeId/families` and `/tree/$treeId/family/$familyId`

---

## Phase 5 Deliverables

### Files Created

```
src/pages/
├── IndividualsPage.tsx
├── IndividualViewPage.tsx
├── FamiliesPage.tsx
└── FamilyViewPage.tsx
src/routes/tree/$treeId/
├── individuals.tsx
├── individual/$individualId.tsx
├── families.tsx
└── family/$familyId.tsx
```

### Final Checklist

- [x] Individual list page displays
- [x] Individual view page displays
- [x] Family list page displays
- [x] Family view page displays
- [x] Navigation works
- [x] Basic styling applied (HTML/CSS only)

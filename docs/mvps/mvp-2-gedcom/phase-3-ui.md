# Phase 3: UI

## Objective

Create Import and Export UI components and integrate them with the Home page.

## Step 3.1: Import Form Window

### src/pages/standalone/ImportGedcomForm.tsx

**MVP1**: Standalone form window (no overlay) for GEDCOM import. Loaded at route `/#/standalone/import-gedcom?treeId=...` in a native Tauri window without MainLayout.

```typescript
import { useState } from 'react';
import { GedcomManager } from '$/managers/GedcomManager';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';

export function ImportGedcomForm() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ individuals: number; families: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "GEDCOM", extensions: ["ged", "gedcom"] }],
    });

    if (!selected) return;

    setFilePath(selected as string);
    setError(null);

    // Preview file
    try {
      const content = await readTextFile(selected as string);
      const validation = await GedcomManager.validate(content);
      if (validation.valid) {
        setPreview({
          individuals: validation.stats.individuals,
          families: validation.stats.families,
        });
      } else {
        setError(validation.errors.join(', '));
      }
    } catch (e) {
      setError('Failed to read file');
    }
  };

  const handleImport = async () => {
    if (!filePath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await GedcomManager.importFromFile();
      if (result) {
        // Notify the main window so it can refresh
        await emit('gedcom-imported', { treeId: result.treeId });
        await getCurrentWindow().close();
      }
    } catch (e) {
      setError('Import failed: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await getCurrentWindow().close();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Import GEDCOM</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleSelectFile} disabled={loading}>
          {filePath ? 'Change File' : 'Select File'}
        </button>
        {filePath && <p style={{ marginTop: '0.5rem' }}>{filePath}</p>}
      </div>

      {preview && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
          <p><strong>Preview:</strong></p>
          <p>{preview.individuals} individuals</p>
          <p>{preview.families} families</p>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c00' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={handleCancel} disabled={loading}>Cancel</button>
        <button onClick={handleImport} disabled={!filePath || loading}>
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );
}
```

---

## Step 3.2: Export Form Window

### src/pages/standalone/ExportGedcomForm.tsx

**MVP1**: Standalone form window (no overlay) for GEDCOM export. Loaded at route `/#/standalone/export-gedcom?treeId=...` in a native Tauri window without MainLayout.

```typescript
import { useState } from 'react';
import { GedcomManager } from '$/managers/GedcomManager';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSearch } from '@tanstack/react-router';

export function ExportGedcomForm() {
  const { treeName } = useSearch({ from: '/standalone/export-gedcom' });
  const [includePrivate, setIncludePrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await GedcomManager.exportToFile(treeName, includePrivate);
      if (success) {
        await getCurrentWindow().close();
      } else {
        setError('Export cancelled');
      }
    } catch (e) {
      setError('Export failed: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await getCurrentWindow().close();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Export GEDCOM</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={includePrivate}
            onChange={(e) => setIncludePrivate(e.target.checked)}
          />
          Include living individuals
        </label>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c00' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={handleCancel} disabled={loading}>Cancel</button>
        <button onClick={handleExport} disabled={loading}>
          {loading ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}
```

---

## Step 3.3: Integration with Home Page

### Update src/pages/Home.tsx

Instead of managing modal state, the Home page opens native Tauri form windows via `openFormWindow`. No modal state (`importModalOpen`, `exportModalOpen`) is needed in the main window.

```typescript
import { useQuery } from '@tanstack/react-query';
import { getAllTrees } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';
import { openFormWindow } from '$/lib/openFormWindow';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';

export function HomePage() {
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const { data: trees, isLoading, refetch } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const selectedTree = trees?.find(t => t.id === selectedTreeId);

  // Listen for events emitted by form windows
  useEffect(() => {
    const unlisten = listen<{ treeId: string }>('gedcom-imported', (event) => {
      setSelectedTreeId(event.payload.treeId);
      refetch();
    });
    return () => { unlisten.then(fn => fn()); };
  }, [refetch]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* ... existing Home page content ... */}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => openFormWindow('/standalone/import-gedcom', {
            title: 'Import GEDCOM',
            width: 520,
            height: 480,
          })}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
        >
          Import GEDCOM
        </button>
        {selectedTree && (
          <button
            onClick={() => openFormWindow('/standalone/export-gedcom', {
              title: 'Export GEDCOM',
              width: 520,
              height: 360,
              params: { treeName: selectedTree.name },
            })}
            style={{ padding: '0.5rem 1rem' }}
          >
            Export GEDCOM
          </button>
        )}
      </div>

      {/* ... rest of Home page ... */}
    </div>
  );
}
```

---

## Phase 3 Deliverables

### Files Created

```
src/pages/standalone/
├── ImportGedcomForm.tsx
└── ExportGedcomForm.tsx
```

### Final Checklist

- [ ] Import form window opens as a standalone native window
- [ ] File selection works
- [ ] Preview shows correct stats
- [ ] Import works and closes the window
- [ ] Export form window opens as a standalone native window
- [ ] Export options work
- [ ] Export works and closes the window
- [ ] Error handling works
- [ ] Form windows integrated with Home page (no modal state in main window)

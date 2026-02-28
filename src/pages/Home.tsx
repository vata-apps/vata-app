import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import { getAllTrees, createTree, updateTree, deleteTree, markTreeOpened } from '$/db/system/trees';
import { getSystemDebugData, listTreeDatabaseFiles } from '$/db/system/debug';
import { openTreeDb } from '$/db/connection';
import { useAppStore } from '$/store/app-store';
import { queryKeys } from '$lib/query-keys';
import { ConfirmDialog } from '$components/ConfirmDialog';
import { ImportGedcomModal } from '$components/ImportGedcomModal';
import { ExportGedcomModal } from '$components/ExportGedcomModal';

function toFilename(): string {
  return `${crypto.randomUUID()}.db`;
}

export function HomePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setCurrentTree = useAppStore((s) => s.setCurrentTree);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [exportTreeId, setExportTreeId] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const { data: trees, isLoading } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  const { data: systemDebugData } = useQuery({
    queryKey: ['debug', 'system'],
    queryFn: getSystemDebugData,
    enabled: showDebug,
  });

  const { data: treeFiles } = useQuery({
    queryKey: ['debug', 'treeFiles'],
    queryFn: listTreeDatabaseFiles,
    enabled: showDebug,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; filename: string; description?: string }) =>
      createTree(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setShowNewForm(false);
      setNewName('');
      setNewDescription('');
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateTree(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setRenamingId(null);
      setRenameValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      await deleteTree(id);
      try {
        await remove(`trees/${filename}`, { baseDir: BaseDirectory.AppData });
      } catch {
        // File may not exist — ignore
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
    },
  });

  const openMutation = useMutation({
    mutationFn: async (tree: { id: string; filename: string }) => {
      await openTreeDb(tree.filename);
      await markTreeOpened(tree.id);
      setCurrentTree(tree.id);
      return tree.id;
    },
    onSuccess: (treeId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      void navigate({ to: '/tree/$treeId', params: { treeId } });
    },
    onError: (error) => {
      console.error('Failed to open tree:', error);
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      filename: toFilename(),
      description: newDescription.trim() || undefined,
    });
  }

  function handleRenameStart(id: string, currentName: string) {
    setRenamingId(id);
    setRenameValue(currentName);
  }

  function handleRenameSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!renameValue.trim()) return;
    renameMutation.mutate({ id, name: renameValue.trim() });
  }

  function handleRenameCancel() {
    setRenamingId(null);
    setRenameValue('');
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId || !trees) return;
    const tree = trees.find((t) => t.id === confirmDeleteId);
    if (!tree) return;
    deleteMutation.mutate({ id: tree.id, filename: tree.filename });
    setConfirmDeleteId(null);
  }

  function handleDeleteCancel() {
    setConfirmDeleteId(null);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Vata</h1>
        <p style={{ color: '#666' }}>Genealogical tree management</p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {showNewForm ? 'Cancel' : 'New Tree'}
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Import GEDCOM
        </button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleCreate}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '2rem',
            maxWidth: '400px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create New Tree</h3>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Family Tree"
              required
              style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional description"
              style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !newName.trim()}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Tree'}
          </button>
          {createMutation.isError && (
            <p style={{ color: 'red', marginTop: '0.5rem' }}>
              Error: {String(createMutation.error)}
            </p>
          )}
        </form>
      )}

      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      ) : trees && trees.length > 0 ? (
        <>
          <h2>Your Trees</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {trees.map((tree) => (
              <div
                key={tree.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                {renamingId === tree.id ? (
                  <form
                    onSubmit={(e) => handleRenameSubmit(e, tree.id)}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        boxSizing: 'border-box',
                        marginBottom: '0.5rem',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={renameMutation.isPending || !renameValue.trim()}
                        style={{ padding: '0.4rem 0.75rem', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleRenameCancel}
                        style={{ padding: '0.4rem 0.75rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <h3 style={{ margin: '0 0 0.5rem' }}>{tree.name}</h3>
                )}
                {tree.description && (
                  <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0.5rem' }}>
                    {tree.description}
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 0.25rem' }}>
                  {tree.individualCount} individuals · {tree.familyCount} families
                </p>
                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 0.25rem' }}>
                  Created: {new Date(tree.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0 0 1rem' }}>
                  Last opened:{' '}
                  {tree.lastOpenedAt ? new Date(tree.lastOpenedAt).toLocaleDateString() : 'Never'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openMutation.mutate({ id: tree.id, filename: tree.filename })}
                    disabled={openMutation.isPending}
                    style={{ flex: 1, padding: '0.5rem', cursor: 'pointer' }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setExportTreeId(tree.id)}
                    style={{ padding: '0.5rem', cursor: 'pointer' }}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleRenameStart(tree.id, tree.name)}
                    disabled={renamingId !== null}
                    style={{ padding: '0.5rem', cursor: 'pointer' }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(tree.id)}
                    disabled={deleteMutation.isPending}
                    style={{ padding: '0.5rem', cursor: 'pointer', color: '#c00' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No trees yet. Create your first genealogical tree to get started.
        </p>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete tree"
        message={`Delete "${trees?.find((t) => t.id === confirmDeleteId)?.name ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <ImportGedcomModal
        isOpen={showImportModal}
        onSuccess={(treeId) => {
          setShowImportModal(false);
          void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
          void navigate({ to: '/tree/$treeId', params: { treeId } });
        }}
        onCancel={() => setShowImportModal(false)}
      />

      <ExportGedcomModal
        isOpen={exportTreeId !== null}
        treeName={trees?.find((t) => t.id === exportTreeId)?.name ?? ''}
        treeFilename={trees?.find((t) => t.id === exportTreeId)?.filename ?? ''}
        onSuccess={() => setExportTreeId(null)}
        onCancel={() => setExportTreeId(null)}
      />

      {/* Debug Section */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
        <button
          onClick={() => setShowDebug((v) => !v)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginBottom: '1rem' }}
        >
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>

        {showDebug && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Tree Database Files */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h3 style={{ marginTop: 0 }}>Tree Database Files</h3>
              {treeFiles && treeFiles.length > 0 ? (
                <ul style={{ margin: 0, padding: '0 0 0 1.5rem' }}>
                  {treeFiles.map((filename) => (
                    <li key={filename} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {filename}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No tree database files found</p>
              )}
            </div>

            {/* Raw system.db Content */}
            <div style={{ flex: '2', minWidth: '400px' }}>
              <h3 style={{ marginTop: 0 }}>Raw system.db Content</h3>
              {systemDebugData ? (
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    fontSize: '0.8rem',
                    margin: 0,
                  }}
                >
                  {JSON.stringify(systemDebugData, null, 2)}
                </pre>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

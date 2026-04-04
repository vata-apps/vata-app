import { useState, type KeyboardEvent } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { GedcomManager } from '$/managers/GedcomManager';

interface ImportGedcomModalProps {
  isOpen: boolean;
  onSuccess: (treeId: string) => void;
  onCancel: () => void;
}

interface PreviewStats {
  individuals: number;
  families: number;
}

export function ImportGedcomModal({ isOpen, onSuccess, onCancel }: ImportGedcomModalProps) {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFilePath(null);
    setFileContent(null);
    setPreview(null);
    setLoading(false);
    setError(null);
  };

  const handleSelectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'GEDCOM', extensions: ['ged', 'gedcom'] }],
    });

    if (!selected) return;

    const path = selected as string;
    setFilePath(path);
    setError(null);
    setPreview(null);

    try {
      const content = await readTextFile(path);
      setFileContent(content);

      const validation = GedcomManager.validate(content);
      if (validation.valid) {
        setPreview({
          individuals: validation.stats.individuals,
          families: validation.stats.families,
        });
      } else {
        setError(validation.errors.join(', ') || 'Invalid GEDCOM file');
      }
    } catch {
      setError('Failed to read file');
    }
  };

  const handleImport = async () => {
    if (!fileContent || !filePath) return;

    setLoading(true);
    setError(null);

    try {
      const filename = filePath.split('/').pop() ?? 'imported';
      const treeName = filename.replace(/\.[^.]+$/, '');

      const result = await GedcomManager.importFromContent(fileContent, treeName);
      reset();
      onSuccess(result.treeId);
    } catch (e) {
      setError('Import failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (!isOpen) return null;

  const fileName = filePath?.split('/').pop();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-gedcom-title"
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '6px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h3 id="import-gedcom-title" style={{ margin: '0 0 1rem' }}>
          Import GEDCOM
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleSelectFile}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {filePath ? 'Change File' : 'Select File'}
          </button>
          {fileName && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>{fileName}</p>
          )}
        </div>

        {preview && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Preview:</p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>
              {preview.individuals} individuals, {preview.families} families
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || loading}
            style={{
              padding: '0.5rem 1rem',
              cursor: preview && !loading ? 'pointer' : 'not-allowed',
              color: '#fff',
              background: preview && !loading ? '#007bff' : '#ccc',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

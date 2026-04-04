import { useState, useEffect, type KeyboardEvent } from 'react';
import { GedcomManager } from '$/managers/GedcomManager';
import { openTreeDb } from '$/db/connection';

interface ExportGedcomModalProps {
  isOpen: boolean;
  treeName: string;
  treePath: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExportGedcomModal({
  isOpen,
  treeName,
  treePath,
  onSuccess,
  onCancel,
}: ExportGedcomModalProps) {
  const [includePrivate, setIncludePrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Open tree database when modal opens
  useEffect(() => {
    if (!isOpen || !treePath) return;

    let mounted = true;
    setReady(false);
    openTreeDb(treePath)
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        if (mounted) {
          setError('Failed to open tree: ' + (e instanceof Error ? e.message : String(e)));
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, treePath]);

  const reset = () => {
    setIncludePrivate(false);
    setLoading(false);
    setError(null);
    setReady(false);
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await GedcomManager.exportToFile(treeName, includePrivate);
      if (success) {
        reset();
        onSuccess();
      } else {
        // User cancelled the save dialog
        setLoading(false);
      }
    } catch (e) {
      setError('Export failed: ' + (e instanceof Error ? e.message : String(e)));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (!isOpen) return null;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleCancel();
  }

  return (
    <div
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-gedcom-title"
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
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h3 id="export-gedcom-title" style={{ margin: '0 0 1rem' }}>Export GEDCOM</h3>

        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#555' }}>
          Export "{treeName}" to GEDCOM 5.5.1 format.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={includePrivate}
              onChange={(e) => setIncludePrivate(e.target.checked)}
            />
            <span>Include living individuals</span>
          </label>
          <p style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.8rem', color: '#888' }}>
            When unchecked, living individuals are excluded for privacy.
          </p>
        </div>

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
            onClick={handleExport}
            disabled={loading || !ready}
            style={{
              padding: '0.5rem 1rem',
              cursor: loading || !ready ? 'not-allowed' : 'pointer',
              color: '#fff',
              background: loading || !ready ? '#ccc' : '#007bff',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            {!ready ? 'Loading...' : loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

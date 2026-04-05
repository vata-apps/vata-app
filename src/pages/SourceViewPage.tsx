import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSource } from '$/hooks/useSources';
import { useRepository, useRepositories } from '$/hooks/useRepositories';
import { deleteSource, updateSource } from '$db-tree/sources';
import { queryKeys } from '$/lib/query-keys';
import { ConfirmDialog } from '$/components/ConfirmDialog';
import type { UpdateSourceInput } from '$/types/database';

interface SourceViewPageProps {
  treeId: string;
  sourceId: string;
}

interface EditFormState {
  title: string;
  author: string;
  publisher: string;
  publicationDate: string;
  repositoryId: string;
  callNumber: string;
  url: string;
  notes: string;
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  display: 'block',
  marginBottom: '0.25rem',
};

interface RepositorySectionProps {
  treeId: string;
  repositoryId: string;
}

function RepositorySection({ treeId, repositoryId }: RepositorySectionProps): JSX.Element {
  const { data: repository, isLoading } = useRepository(repositoryId);

  if (isLoading) {
    return <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading repository...</p>;
  }

  if (!repository) {
    return <p style={{ color: '#888', fontSize: '0.9rem' }}>Repository not found.</p>;
  }

  const location = [repository.city, repository.country].filter(Boolean).join(', ');

  return (
    <Link
      to="/tree/$treeId/repository/$repositoryId"
      params={{ treeId, repositoryId: repository.id }}
      style={{
        display: 'block',
        padding: '0.75rem 1rem',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ fontWeight: 600 }}>{repository.name}</div>
      {location && (
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{location}</div>
      )}
    </Link>
  );
}

export function SourceViewPage({ treeId, sourceId }: SourceViewPageProps): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: source, isLoading, isError } = useSource(sourceId);
  const { data: repositories } = useRepositories();

  const { mutate: runDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteSource(sourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      void navigate({ to: '/tree/$treeId/sources', params: { treeId } });
    },
  });

  const { mutate: runUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (input: UpdateSourceInput) => updateSource(sourceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      void queryClient.invalidateQueries({ queryKey: queryKeys.source(sourceId) });
      setIsEditing(false);
      setEditError(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setEditError(message);
    },
  });

  function openEdit() {
    if (!source) return;
    setEditForm({
      title: source.title,
      author: source.author ?? '',
      publisher: source.publisher ?? '',
      publicationDate: source.publicationDate ?? '',
      repositoryId: source.repositoryId ?? '',
      callNumber: source.callNumber ?? '',
      url: source.url ?? '',
      notes: source.notes ?? '',
    });
    setEditError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditForm(null);
    setEditError(null);
  }

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm || !editForm.title.trim()) return;

    const input: UpdateSourceInput = {
      title: editForm.title.trim(),
      author: editForm.author.trim() || undefined,
      publisher: editForm.publisher.trim() || undefined,
      publicationDate: editForm.publicationDate.trim() || undefined,
      repositoryId: editForm.repositoryId || undefined,
      callNumber: editForm.callNumber.trim() || undefined,
      url: editForm.url.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    };

    runUpdate(input);
  }

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading source...</p>;
  }

  if (isError || !source) {
    return (
      <div>
        <Link
          to="/tree/$treeId/sources"
          params={{ treeId }}
          style={{ color: '#666', textDecoration: 'none' }}
        >
          &larr; Back to Sources
        </Link>
        <p style={{ color: '#c00', marginTop: '1rem' }}>Source not found.</p>
      </div>
    );
  }

  if (isEditing && editForm) {
    return (
      <div>
        <button
          onClick={cancelEdit}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem',
          }}
        >
          &larr; Cancel Edit
        </button>

        <h1 style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>Edit Source</h1>

        <form onSubmit={handleEditSubmit} style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-title" style={labelStyle}>
              Title <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              id="edit-source-title"
              name="title"
              type="text"
              required
              value={editForm.title}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-author" style={labelStyle}>
              Author
            </label>
            <input
              id="edit-source-author"
              name="author"
              type="text"
              value={editForm.author}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-publisher" style={labelStyle}>
              Publisher
            </label>
            <input
              id="edit-source-publisher"
              name="publisher"
              type="text"
              value={editForm.publisher}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-publication-date" style={labelStyle}>
              Publication Date
            </label>
            <input
              id="edit-source-publication-date"
              name="publicationDate"
              type="text"
              value={editForm.publicationDate}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-repository" style={labelStyle}>
              Repository
            </label>
            <select
              id="edit-source-repository"
              name="repositoryId"
              value={editForm.repositoryId}
              onChange={handleFieldChange}
              style={inputStyle}
            >
              <option value="">— None —</option>
              {repositories?.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-callnumber" style={labelStyle}>
              Call Number
            </label>
            <input
              id="edit-source-callnumber"
              name="callNumber"
              type="text"
              value={editForm.callNumber}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-source-url" style={labelStyle}>
              URL
            </label>
            <input
              id="edit-source-url"
              name="url"
              type="url"
              value={editForm.url}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="edit-source-notes" style={labelStyle}>
              Notes
            </label>
            <textarea
              id="edit-source-notes"
              name="notes"
              rows={3}
              value={editForm.notes}
              onChange={handleFieldChange}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {editError && (
            <p style={{ color: '#c00', fontSize: '0.85rem', marginBottom: '1rem' }}>{editError}</p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isUpdating}
              style={{
                padding: '0.5rem 1rem',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
                background: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !editForm.title.trim()}
              style={{
                padding: '0.5rem 1rem',
                cursor: isUpdating || !editForm.title.trim() ? 'not-allowed' : 'pointer',
                background: '#333',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.9rem',
                opacity: isUpdating || !editForm.title.trim() ? 0.6 : 1,
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/tree/$treeId/sources"
        params={{ treeId }}
        style={{ color: '#666', textDecoration: 'none' }}
      >
        &larr; Back to Sources
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{source.title}</h1>
          <div style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.9rem' }}>{source.id}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/tree/$treeId/source/$sourceId/edit"
            params={{ treeId, sourceId }}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              background: '#333',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            Edit
          </Link>
          <button
            onClick={openEdit}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#333',
              fontSize: '0.9rem',
            }}
          >
            Edit Details
          </button>
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid #c00',
              borderRadius: '4px',
              color: '#c00',
              fontSize: '0.9rem',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Details</h2>
        <dl style={{ margin: 0 }}>
          {source.author && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>Author</dt>
              <dd style={{ margin: 0, color: '#555' }}>{source.author}</dd>
            </div>
          )}
          {source.publisher && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>Publisher</dt>
              <dd style={{ margin: 0, color: '#555' }}>{source.publisher}</dd>
            </div>
          )}
          {source.publicationDate && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>
                Publication Date
              </dt>
              <dd style={{ margin: 0, color: '#555' }}>{source.publicationDate}</dd>
            </div>
          )}
          {source.callNumber && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>
                Call Number
              </dt>
              <dd style={{ margin: 0, color: '#555' }}>{source.callNumber}</dd>
            </div>
          )}
          {source.url && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>URL</dt>
              <dd style={{ margin: 0 }}>
                <a href={source.url} target="_blank" rel="noreferrer" style={{ color: '#06c' }}>
                  {source.url}
                </a>
              </dd>
            </div>
          )}
          {source.notes && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px', fontSize: '0.85rem' }}>Notes</dt>
              <dd style={{ margin: 0, color: '#555', whiteSpace: 'pre-wrap' }}>{source.notes}</dd>
            </div>
          )}
          {!source.author &&
            !source.publisher &&
            !source.publicationDate &&
            !source.callNumber &&
            !source.url &&
            !source.notes && (
              <p style={{ color: '#888', margin: 0 }}>No additional details recorded.</p>
            )}
        </dl>
      </section>

      {source.repositoryId && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Repository</h2>
          <RepositorySection treeId={treeId} repositoryId={source.repositoryId} />
        </section>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete Source"
        message={`Are you sure you want to delete "${source.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={() => runDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

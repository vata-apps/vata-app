import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepository } from '$/hooks/useRepositories';
import { deleteRepository, updateRepository } from '$db-tree/repositories';
import { getSourcesByRepositoryId } from '$db-tree/sources';
import { queryKeys } from '$/lib/query-keys';
import { ConfirmDialog } from '$/components/ConfirmDialog';
import type { UpdateRepositoryInput } from '$/types/database';

interface RepositoryViewPageProps {
  treeId: string;
  repositoryId: string;
}

interface EditFormState {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
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

export function RepositoryViewPage({ treeId, repositoryId }: RepositoryViewPageProps): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: repository, isLoading, isError } = useRepository(repositoryId);

  const { data: sources, isLoading: isSourcesLoading } = useQuery({
    queryKey: [...queryKeys.sources, 'byRepository', repositoryId],
    queryFn: () => getSourcesByRepositoryId(repositoryId),
  });

  const { mutate: runDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteRepository(repositoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources });
      void navigate({ to: '/tree/$treeId/repositories', params: { treeId } });
    },
  });

  const { mutate: runUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (input: UpdateRepositoryInput) => updateRepository(repositoryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
      void queryClient.invalidateQueries({ queryKey: queryKeys.repository(repositoryId) });
      setIsEditing(false);
      setEditError(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setEditError(message);
    },
  });

  function openEdit() {
    if (!repository) return;
    setEditForm({
      name: repository.name,
      address: repository.address ?? '',
      city: repository.city ?? '',
      country: repository.country ?? '',
      phone: repository.phone ?? '',
      email: repository.email ?? '',
      website: repository.website ?? '',
      notes: repository.notes ?? '',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm || !editForm.name.trim()) return;

    const input: UpdateRepositoryInput = {
      name: editForm.name.trim(),
      address: editForm.address.trim() || undefined,
      city: editForm.city.trim() || undefined,
      country: editForm.country.trim() || undefined,
      phone: editForm.phone.trim() || undefined,
      email: editForm.email.trim() || undefined,
      website: editForm.website.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    };

    runUpdate(input);
  }

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading repository...</p>;
  }

  if (isError || !repository) {
    return (
      <div>
        <Link
          to="/tree/$treeId/repositories"
          params={{ treeId }}
          style={{ color: '#666', textDecoration: 'none' }}
        >
          &larr; Back to Repositories
        </Link>
        <p style={{ color: '#c00', marginTop: '1rem' }}>Repository not found.</p>
      </div>
    );
  }

  if (isEditing && editForm) {
    return (
      <div>
        <button
          onClick={cancelEdit}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
        >
          &larr; Cancel Edit
        </button>

        <h1 style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>Edit Repository</h1>

        <form onSubmit={handleEditSubmit} style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-repository-name" style={labelStyle}>
              Name <span style={{ color: '#c00' }}>*</span>
            </label>
            <input
              id="edit-repository-name"
              name="name"
              type="text"
              required
              value={editForm.name}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-repository-address" style={labelStyle}>
              Address
            </label>
            <input
              id="edit-repository-address"
              name="address"
              type="text"
              value={editForm.address}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-repository-city" style={labelStyle}>
                City
              </label>
              <input
                id="edit-repository-city"
                name="city"
                type="text"
                value={editForm.city}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-repository-country" style={labelStyle}>
                Country
              </label>
              <input
                id="edit-repository-country"
                name="country"
                type="text"
                value={editForm.country}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-repository-phone" style={labelStyle}>
                Phone
              </label>
              <input
                id="edit-repository-phone"
                name="phone"
                type="tel"
                value={editForm.phone}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-repository-email" style={labelStyle}>
                Email
              </label>
              <input
                id="edit-repository-email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleFieldChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="edit-repository-website" style={labelStyle}>
              Website
            </label>
            <input
              id="edit-repository-website"
              name="website"
              type="url"
              value={editForm.website}
              onChange={handleFieldChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="edit-repository-notes" style={labelStyle}>
              Notes
            </label>
            <textarea
              id="edit-repository-notes"
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
              disabled={isUpdating || !editForm.name.trim()}
              style={{
                padding: '0.5rem 1rem',
                cursor: isUpdating || !editForm.name.trim() ? 'not-allowed' : 'pointer',
                background: '#333',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.9rem',
                opacity: isUpdating || !editForm.name.trim() ? 0.6 : 1,
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const hasDetails =
    repository.address ||
    repository.city ||
    repository.country ||
    repository.phone ||
    repository.email ||
    repository.website ||
    repository.notes;

  return (
    <div>
      <Link
        to="/tree/$treeId/repositories"
        params={{ treeId }}
        style={{ color: '#666', textDecoration: 'none' }}
      >
        &larr; Back to Repositories
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
          <h1 style={{ margin: 0 }}>{repository.name}</h1>
          <div style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.9rem' }}>{repository.id}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            Edit
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
          {repository.address && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Address</dt>
              <dd style={{ margin: 0, color: '#555' }}>{repository.address}</dd>
            </div>
          )}
          {repository.city && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>City</dt>
              <dd style={{ margin: 0, color: '#555' }}>{repository.city}</dd>
            </div>
          )}
          {repository.country && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Country</dt>
              <dd style={{ margin: 0, color: '#555' }}>{repository.country}</dd>
            </div>
          )}
          {repository.phone && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Phone</dt>
              <dd style={{ margin: 0, color: '#555' }}>{repository.phone}</dd>
            </div>
          )}
          {repository.email && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Email</dt>
              <dd style={{ margin: 0 }}>
                <a href={`mailto:${repository.email}`} style={{ color: '#06c' }}>
                  {repository.email}
                </a>
              </dd>
            </div>
          )}
          {repository.website && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Website</dt>
              <dd style={{ margin: 0 }}>
                <a
                  href={repository.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#06c' }}
                >
                  {repository.website}
                </a>
              </dd>
            </div>
          )}
          {repository.notes && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ fontWeight: 600, minWidth: '100px', fontSize: '0.85rem' }}>Notes</dt>
              <dd style={{ margin: 0, color: '#555', whiteSpace: 'pre-wrap' }}>{repository.notes}</dd>
            </div>
          )}
          {!hasDetails && (
            <p style={{ color: '#888', margin: 0 }}>No additional details recorded.</p>
          )}
        </dl>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Sources</h2>
        {isSourcesLoading ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading sources...</p>
        ) : !sources || sources.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>No sources linked to this repository.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sources.map((source) => (
              <Link
                key={source.id}
                to="/tree/$treeId/source/$sourceId"
                params={{ treeId, sourceId: source.id }}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 600 }}>{source.title}</div>
                {source.author && (
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    {source.author}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete Repository"
        message={`Are you sure you want to delete "${repository.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={() => runDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

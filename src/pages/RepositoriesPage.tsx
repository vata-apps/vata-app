import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '$/hooks/useRepositories';
import { createRepository } from '$db-tree/repositories';
import { queryKeys } from '$/lib/query-keys';
import type { CreateRepositoryInput } from '$/types/database';

interface RepositoriesPageProps {
  treeId: string;
}

interface NewRepositoryFormState {
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
}

const EMPTY_FORM: NewRepositoryFormState = {
  name: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  notes: '',
};

export function RepositoriesPage({ treeId }: RepositoriesPageProps): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewRepositoryFormState>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { data: repositories, isLoading, isError } = useRepositories();

  const { mutate: submitCreate, isPending } = useMutation({
    mutationFn: (input: CreateRepositoryInput) => createRepository(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
      setModalOpen(false);
      setForm(EMPTY_FORM);
      setSubmitError(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmitError(message);
    },
  });

  function openModal() {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setSubmitError(null);
  }

  useEffect(() => {
    if (modalOpen) {
      nameInputRef.current?.focus();
    }
  }, [modalOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      closeModal();
    }
  }

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const input: CreateRepositoryInput = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      website: form.website.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    submitCreate(input);
  }

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading repositories...</p>;
  }

  if (isError) {
    return <p style={{ color: '#c00' }}>Failed to load repositories.</p>;
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

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>Repositories</h1>
        <button
          onClick={openModal}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            background: '#333',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '0.9rem',
          }}
        >
          New Repository
        </button>
      </div>

      {!repositories || repositories.length === 0 ? (
        <p style={{ color: '#666' }}>No repositories found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {repositories.map((repo) => (
            <Link
              key={repo.id}
              to="/tree/$treeId/repository/$repositoryId"
              params={{ treeId, repositoryId: repo.id }}
              style={{
                display: 'block',
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                {repo.id}
              </div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{repo.name}</div>
              {(repo.city || repo.country) && (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {[repo.city, repo.country].filter(Boolean).join(', ')}
                </div>
              )}
              {repo.website && (
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                  {repo.website}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-repository-dialog-title"
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 id="new-repository-dialog-title" style={{ margin: '0 0 1.25rem' }}>
              New Repository
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="repository-name" style={labelStyle}>
                  Name <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="repository-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="repository-address" style={labelStyle}>
                  Address
                </label>
                <input
                  id="repository-address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="repository-city" style={labelStyle}>
                    City
                  </label>
                  <input
                    id="repository-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleFieldChange}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="repository-country" style={labelStyle}>
                    Country
                  </label>
                  <input
                    id="repository-country"
                    name="country"
                    type="text"
                    value={form.country}
                    onChange={handleFieldChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="repository-phone" style={labelStyle}>
                    Phone
                  </label>
                  <input
                    id="repository-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFieldChange}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="repository-email" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="repository-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFieldChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="repository-website" style={labelStyle}>
                  Website
                </label>
                <input
                  id="repository-website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="repository-notes" style={labelStyle}>
                  Notes
                </label>
                <textarea
                  id="repository-notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleFieldChange}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {submitError && (
                <p style={{ color: '#c00', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {submitError}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: isPending ? 'not-allowed' : 'pointer',
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
                  disabled={isPending || !form.name.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: isPending || !form.name.trim() ? 'not-allowed' : 'pointer',
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    opacity: isPending || !form.name.trim() ? 0.6 : 1,
                  }}
                >
                  {isPending ? 'Saving...' : 'Create Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

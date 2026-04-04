import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchSources } from '$/hooks/useSources';
import { useRepositories } from '$/hooks/useRepositories';
import { createSource } from '$db-tree/sources';
import { queryKeys } from '$/lib/query-keys';
import type { CreateSourceInput } from '$/types/database';

interface SourcesPageProps {
  treeId: string;
}

interface NewSourceFormState {
  title: string;
  author: string;
  publisher: string;
  publicationDate: string;
  repositoryId: string;
  callNumber: string;
  url: string;
  notes: string;
}

const EMPTY_FORM: NewSourceFormState = {
  title: '',
  author: '',
  publisher: '',
  publicationDate: '',
  repositoryId: '',
  callNumber: '',
  url: '',
  notes: '',
};

export function SourcesPage({ treeId }: SourcesPageProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewSourceFormState>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { data: sources, isLoading, isError } = useSearchSources(query);
  const { data: repositories } = useRepositories();

  const { mutate: submitCreate, isPending } = useMutation({
    mutationFn: (input: CreateSourceInput) => createSource(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sources });
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
      titleInputRef.current?.focus();
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

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const input: CreateSourceInput = {
      title: form.title.trim(),
      author: form.author.trim() || undefined,
      publisher: form.publisher.trim() || undefined,
      publicationDate: form.publicationDate.trim() || undefined,
      repositoryId: form.repositoryId || undefined,
      callNumber: form.callNumber.trim() || undefined,
      url: form.url.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    submitCreate(input);
  }

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading sources...</p>;
  }

  if (isError) {
    return <p style={{ color: '#c00' }}>Failed to load sources.</p>;
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
        <h1 style={{ margin: 0 }}>Sources</h1>
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
          New Source
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search by title or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px' }}
        />
      </div>

      {!sources || sources.length === 0 ? (
        <p style={{ color: '#666' }}>
          {query.trim() ? 'No sources match your search.' : 'No sources found.'}
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {sources.map((source) => (
            <Link
              key={source.id}
              to="/tree/$treeId/source/$sourceId"
              params={{ treeId, sourceId: source.id }}
              style={{
                display: 'block',
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                {source.id}
              </div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{source.title}</div>
              {source.author && (
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{source.author}</div>
              )}
              {source.repositoryId && (
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                  Repository: {source.repositoryId}
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
            aria-labelledby="new-source-dialog-title"
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
            <h2 id="new-source-dialog-title" style={{ margin: '0 0 1.25rem' }}>
              New Source
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-title" style={labelStyle}>
                  Title <span style={{ color: '#c00' }}>*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="source-title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-author" style={labelStyle}>
                  Author
                </label>
                <input
                  id="source-author"
                  name="author"
                  type="text"
                  value={form.author}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-publisher" style={labelStyle}>
                  Publisher
                </label>
                <input
                  id="source-publisher"
                  name="publisher"
                  type="text"
                  value={form.publisher}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-publication-date" style={labelStyle}>
                  Publication Date
                </label>
                <input
                  id="source-publication-date"
                  name="publicationDate"
                  type="text"
                  value={form.publicationDate}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-repository" style={labelStyle}>
                  Repository
                </label>
                <select
                  id="source-repository"
                  name="repositoryId"
                  value={form.repositoryId}
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
                <label htmlFor="source-callnumber" style={labelStyle}>
                  Call Number
                </label>
                <input
                  id="source-callnumber"
                  name="callNumber"
                  type="text"
                  value={form.callNumber}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="source-url" style={labelStyle}>
                  URL
                </label>
                <input
                  id="source-url"
                  name="url"
                  type="url"
                  value={form.url}
                  onChange={handleFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="source-notes" style={labelStyle}>
                  Notes
                </label>
                <textarea
                  id="source-notes"
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
                  disabled={isPending || !form.title.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: isPending || !form.title.trim() ? 'not-allowed' : 'pointer',
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    opacity: isPending || !form.title.trim() ? 0.6 : 1,
                  }}
                >
                  {isPending ? 'Saving...' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

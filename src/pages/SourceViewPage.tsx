import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSource } from '$/hooks/useSources';
import { useRepository, useRepositories } from '$/hooks/useRepositories';
import { deleteSource, updateSource } from '$db-tree/sources';
import { queryKeys } from '$/lib/query-keys';
import { ConfirmDialog } from '$/components/ConfirmDialog';
import { Button } from '$components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import { Textarea } from '$components/ui/textarea';
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

interface RepositorySectionProps {
  treeId: string;
  repositoryId: string;
}

function RepositorySection({ treeId, repositoryId }: RepositorySectionProps): JSX.Element {
  const { t } = useTranslation('common');
  const { data: repository, isLoading } = useRepository(repositoryId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('status.loading')}</p>;
  }

  if (!repository) {
    return <p className="text-sm text-muted-foreground">{t('errors.notFound')}</p>;
  }

  const location = [repository.city, repository.country].filter(Boolean).join(', ');

  return (
    <Link
      to="/tree/$treeId/repository/$repositoryId"
      params={{ treeId, repositoryId: repository.id }}
      className="block rounded-md border border-border p-4 no-underline hover:bg-accent"
    >
      <div className="font-semibold">{repository.name}</div>
      {location && <div className="mt-1 text-sm text-muted-foreground">{location}</div>}
    </Link>
  );
}

export function SourceViewPage({ treeId, sourceId }: SourceViewPageProps): JSX.Element {
  const { t: tc } = useTranslation('common');
  const { t: ts } = useTranslation('sources');
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
      const message = err instanceof Error ? err.message : tc('errors.generic');
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
    return <p className="text-muted-foreground">{tc('status.loading')}</p>;
  }

  if (isError || !source) {
    return (
      <div>
        <Link
          to="/tree/$treeId/sources"
          params={{ treeId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; {ts('backToList')}
        </Link>
        <p className="mt-4 text-destructive">{tc('errors.notFound')}</p>
      </div>
    );
  }

  if (isEditing && editForm) {
    return (
      <div>
        <button
          onClick={cancelEdit}
          className="border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          &larr; {ts('cancelEdit')}
        </button>

        <h1 className="mt-4 mb-6 text-xl font-bold">{ts('editTitle')}</h1>

        <form onSubmit={handleEditSubmit} className="max-w-[500px] space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-source-title">
              {ts('form.title')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-source-title"
              name="title"
              type="text"
              required
              value={editForm.title}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-author">{ts('form.author')}</Label>
            <Input
              id="edit-source-author"
              name="author"
              type="text"
              value={editForm.author}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-publisher">{ts('form.publisher')}</Label>
            <Input
              id="edit-source-publisher"
              name="publisher"
              type="text"
              value={editForm.publisher}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-publication-date">{ts('form.publicationDate')}</Label>
            <Input
              id="edit-source-publication-date"
              name="publicationDate"
              type="text"
              value={editForm.publicationDate}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-repository">{ts('form.repository')}</Label>
            <select
              id="edit-source-repository"
              name="repositoryId"
              value={editForm.repositoryId}
              onChange={handleFieldChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{ts('form.repositoryNone')}</option>
              {repositories?.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-callnumber">{ts('form.callNumber')}</Label>
            <Input
              id="edit-source-callnumber"
              name="callNumber"
              type="text"
              value={editForm.callNumber}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-url">{ts('form.url')}</Label>
            <Input
              id="edit-source-url"
              name="url"
              type="url"
              value={editForm.url}
              onChange={handleFieldChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-source-notes">{ts('form.notes')}</Label>
            <Textarea
              id="edit-source-notes"
              name="notes"
              rows={3}
              value={editForm.notes}
              onChange={handleFieldChange}
              className="resize-y"
            />
          </div>

          {editError && <p className="text-sm text-destructive">{editError}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isUpdating}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isUpdating || !editForm.title.trim()}>
              {isUpdating ? tc('status.saving') : tc('actions.save')}
            </Button>
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
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; {ts('backToList')}
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{source.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{source.id}</div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/tree/$treeId/source/$sourceId/edit" params={{ treeId, sourceId }}>
              {tc('actions.edit')}
            </Link>
          </Button>
          <Button variant="outline" onClick={openEdit}>
            {ts('editDetails')}
          </Button>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            {tc('actions.delete')}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{ts('details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="m-0">
            {source.author && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.author')}</dt>
                <dd className="m-0 text-muted-foreground">{source.author}</dd>
              </div>
            )}
            {source.publisher && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.publisher')}</dt>
                <dd className="m-0 text-muted-foreground">{source.publisher}</dd>
              </div>
            )}
            {source.publicationDate && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.publicationDate')}</dt>
                <dd className="m-0 text-muted-foreground">{source.publicationDate}</dd>
              </div>
            )}
            {source.callNumber && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.callNumber')}</dt>
                <dd className="m-0 text-muted-foreground">{source.callNumber}</dd>
              </div>
            )}
            {source.url && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.url')}</dt>
                <dd className="m-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {source.url}
                  </a>
                </dd>
              </div>
            )}
            {source.notes && (
              <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                <dt className="font-semibold">{ts('form.notes')}</dt>
                <dd className="m-0 whitespace-pre-wrap text-muted-foreground">{source.notes}</dd>
              </div>
            )}
            {!source.author &&
              !source.publisher &&
              !source.publicationDate &&
              !source.callNumber &&
              !source.url &&
              !source.notes && <p className="m-0 text-muted-foreground">{ts('noDetails')}</p>}
          </dl>
        </CardContent>
      </Card>

      {source.repositoryId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{ts('form.repository')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RepositorySection treeId={treeId} repositoryId={source.repositoryId} />
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title={ts('deleteTitle')}
        message={ts('deleteConfirm', { title: source.title })}
        confirmLabel={tc('actions.delete')}
        isPending={isDeleting}
        onConfirm={() => runDelete()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

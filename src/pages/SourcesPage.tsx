import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useSources } from '$/hooks/useSources';
import { useRepositories } from '$/hooks/useRepositories';
import { createSource } from '$db-tree/sources';
import { queryKeys } from '$/lib/query-keys';
import type { CreateSourceInput, Source } from '$/types/database';
import { DataTable } from '$components/data-table';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import { Textarea } from '$components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$components/ui/dialog';

interface SourcesPageProps {
  treeId: string;
}

const EMPTY_FORM = {
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
  const { t } = useTranslation('sources');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: sources, isLoading, isError } = useSources();
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
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    },
  });

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

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const columns: ColumnDef<Source, string>[] = [
    {
      accessorKey: 'id',
      header: t('columns.id'),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: 'title',
      header: t('columns.title'),
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    {
      accessorKey: 'author',
      header: t('columns.author'),
      cell: ({ getValue }) => getValue() ?? '',
    },
    {
      id: 'repository',
      header: t('columns.repository'),
      accessorFn: (row) => row.repositoryId ?? '',
    },
  ];

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">{tc('status.loading')}</p>;
  }

  if (isError) {
    return <p className="p-6 text-sm text-destructive">{tc('errors.loadFailed')}</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        <Button
          size="sm"
          onClick={() => {
            setForm(EMPTY_FORM);
            setSubmitError(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {t('newSource')}
        </Button>
      </div>

      {!sources || sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <DataTable
          columns={columns}
          data={sources}
          searchPlaceholder={t('search')}
          onRowClick={(row) =>
            navigate({
              to: '/tree/$treeId/source/$sourceId',
              params: { treeId, sourceId: row.id },
            })
          }
        />
      )}

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false);
            setForm(EMPTY_FORM);
            setSubmitError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('form.createTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-title">{t('form.title')} *</Label>
              <Input
                id="source-title"
                name="title"
                value={form.title}
                onChange={handleFieldChange}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-author">{t('form.author')}</Label>
              <Input
                id="source-author"
                name="author"
                value={form.author}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-publisher">{t('form.publisher')}</Label>
              <Input
                id="source-publisher"
                name="publisher"
                value={form.publisher}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-publication-date">{t('form.publicationDate')}</Label>
              <Input
                id="source-publication-date"
                name="publicationDate"
                value={form.publicationDate}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-repository">{t('form.repository')}</Label>
              <select
                id="source-repository"
                name="repositoryId"
                value={form.repositoryId}
                onChange={handleFieldChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">{t('form.repositoryNone')}</option>
                {repositories?.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-callnumber">{t('form.callNumber')}</Label>
              <Input
                id="source-callnumber"
                name="callNumber"
                value={form.callNumber}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">{t('form.url')}</Label>
              <Input
                id="source-url"
                name="url"
                type="url"
                value={form.url}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-notes">{t('form.notes')}</Label>
              <Textarea
                id="source-notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleFieldChange}
              />
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  setForm(EMPTY_FORM);
                  setSubmitError(null);
                }}
                disabled={isPending}
              >
                {tc('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isPending || !form.title.trim()}>
                {isPending ? tc('status.saving') : t('form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

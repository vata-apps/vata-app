import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useRepositories } from '$/hooks/useRepositories';
import { createRepository } from '$db-tree/repositories';
import { queryKeys } from '$/lib/query-keys';
import type { CreateRepositoryInput, Repository } from '$/types/database';
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

interface RepositoriesPageProps {
  treeId: string;
}

const EMPTY_FORM = {
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
  const { t } = useTranslation('repositories');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    },
  });

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

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const columns = useMemo<ColumnDef<Repository, string>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('columns.id'),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span>,
      },
      {
        accessorKey: 'name',
        header: t('columns.name'),
        cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
      },
      {
        accessorKey: 'city',
        header: t('columns.city'),
        cell: ({ getValue }) => getValue() ?? '',
      },
      {
        accessorKey: 'country',
        header: t('columns.country'),
        cell: ({ getValue }) => getValue() ?? '',
      },
    ],
    [t]
  );

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
          {t('newRepository')}
        </Button>
      </div>

      {!repositories || repositories.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <DataTable
          columns={columns}
          data={repositories}
          searchPlaceholder={t('search')}
          onRowClick={(row) =>
            navigate({
              to: '/tree/$treeId/repository/$repositoryId',
              params: { treeId, repositoryId: row.id },
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
              <Label htmlFor="repo-name">{t('form.name')} *</Label>
              <Input
                id="repo-name"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-address">{t('form.address')}</Label>
              <Input
                id="repo-address"
                name="address"
                value={form.address}
                onChange={handleFieldChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repo-city">{t('form.city')}</Label>
                <Input id="repo-city" name="city" value={form.city} onChange={handleFieldChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo-country">{t('form.country')}</Label>
                <Input
                  id="repo-country"
                  name="country"
                  value={form.country}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repo-phone">{t('form.phone')}</Label>
                <Input
                  id="repo-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFieldChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo-email">{t('form.email')}</Label>
                <Input
                  id="repo-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFieldChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-website">{t('form.website')}</Label>
              <Input
                id="repo-website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo-notes">{t('form.notes')}</Label>
              <Textarea
                id="repo-notes"
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
              <Button type="submit" disabled={isPending || !form.name.trim()}>
                {isPending ? tc('status.saving') : t('form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

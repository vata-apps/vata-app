import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { formatIsoDate } from '$lib/format';
import { Modal } from './Modal';

interface EditTreeModalProps {
  open: boolean;
  onClose: () => void;
  tree: {
    id: string;
    name: string;
    description: string | null;
    individualCount: number;
    createdAt: string | number | Date;
    lastOpenedAt: string | number | Date | null;
  } | null;
  onSubmit: (data: { name: string; description: string | undefined }) => void;
  isPending?: boolean;
  error?: string | null;
}

export function EditTreeModal({
  open,
  onClose,
  tree,
  onSubmit,
  isPending,
  error,
}: EditTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open && tree) {
      setName(tree.name);
      setDescription(tree.description ?? '');
    }
  }, [open, tree]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isPending) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('editModal.title')}
      subtitle={t('editModal.subtitle')}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </button>
          <button
            type="submit"
            form="edit-tree-form"
            className="btn btn-primary"
            disabled={!name.trim() || isPending}
            aria-disabled={!name.trim() || isPending}
          >
            {t('editModal.submit')}
          </button>
        </>
      }
    >
      <form id="edit-tree-form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="flabel" htmlFor="me-name">
            {t('editModal.nameLabel')} <span className="req">*</span>
          </label>
          <input
            id="me-name"
            className="ds-input"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="flabel" htmlFor="me-desc">
            {t('editModal.descriptionLabel')}{' '}
            <span className="font-normal text-muted-foreground">
              {t('editModal.descriptionOptional')}
            </span>
          </label>
          <textarea
            id="me-desc"
            className="ds-textarea"
            placeholder={t('editModal.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {tree && (
          <div className="ds-meta-grid mt-[14px]">
            <MetaCell label={t('editModal.metaIndividuals')} value={String(tree.individualCount)} />
            <MetaCell label={t('editModal.metaCreated')} value={formatIsoDate(tree.createdAt)} />
            <MetaCell
              label={t('editModal.metaLastOpened')}
              value={formatIsoDate(tree.lastOpenedAt)}
            />
          </div>
        )}

        {error && <p className="ferror mt-3">{error}</p>}
      </form>
    </Modal>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="ds-meta-cell-label">{label}</div>
      <div className="ds-meta-cell-value ds-meta-cell-value-sm">{value}</div>
    </div>
  );
}

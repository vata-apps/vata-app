import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteTreeModalProps {
  open: boolean;
  onClose: () => void;
  tree: {
    id: string;
    name: string;
    individualCount: number;
    familyCount: number;
  } | null;
  onConfirm: (opts: { exportBefore: boolean }) => void;
  isPending?: boolean;
  error?: string | null;
}

export function DeleteTreeModal({
  open,
  onClose,
  tree,
  onConfirm,
  isPending,
  error,
}: DeleteTreeModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');
  const [confirmText, setConfirmText] = useState('');
  const [exportBefore, setExportBefore] = useState(true);

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setExportBefore(true);
    }
  }, [open, tree?.id]);

  const canDelete =
    !!tree && confirmText.normalize('NFC') === tree.name.normalize('NFC') && !isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('deleteModal.title', { name: tree?.name ?? '' })}
      subtitle={t('deleteModal.subtitle')}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            aria-disabled={!canDelete}
            onClick={() => {
              if (!canDelete) return;
              onConfirm({ exportBefore });
            }}
          >
            <Trash2 strokeWidth={1.8} />
            {isPending ? t('deleteModal.deleting') : t('deleteModal.submit')}
          </button>
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <DangerCell value={tree?.individualCount ?? 0} label={t('deleteModal.stats.individuals')} />
        <DangerCell value={tree?.familyCount ?? 0} label={t('deleteModal.stats.families')} />
        <DangerCell value="—" label={t('deleteModal.stats.sources')} />
        <DangerCell value="—" label={t('deleteModal.stats.media')} />
      </div>

      <label
        className="toggle-row"
        style={{
          marginTop: 6,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '10px 14px',
          background: 'oklch(from var(--foreground) l c h / 2%)',
        }}
      >
        <div className="toggle-row-body">
          <div className="toggle-row-title">{t('deleteModal.exportBeforeTitle')}</div>
          <div className="toggle-row-desc">{t('deleteModal.exportBeforeDesc')}</div>
        </div>
        <span className="switch">
          <input
            type="checkbox"
            checked={exportBefore}
            onChange={(e) => setExportBefore(e.target.checked)}
          />
          <span className="switch-track">
            <span className="switch-thumb" />
          </span>
        </span>
      </label>

      {tree && (
        <div className="field" style={{ marginTop: 14 }}>
          <label className="flabel" htmlFor="delete-confirm">
            <Trans
              t={t}
              i18nKey="deleteModal.typeToConfirm"
              values={{ name: tree.name }}
              components={{
                code: (
                  <code
                    className="rounded-[4px] px-[6px] py-[1px] font-mono text-[12px] text-foreground"
                    style={{ background: 'oklch(from var(--destructive) l c h / 10%)' }}
                  />
                ),
              }}
            />
          </label>
          <input
            id="delete-confirm"
            className="ds-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('deleteModal.typeToConfirmPlaceholder')}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
      )}

      {error && <p className="ferror mt-3">{error}</p>}
    </Modal>
  );
}

function DangerCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--card)' }}>
      <div
        className="font-mono tabular-nums"
        style={{
          fontSize: 18,
          color: 'var(--destructive)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
      <div className="mt-[2px] font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

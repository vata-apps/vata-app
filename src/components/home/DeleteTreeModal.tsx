import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button } from '$components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$components/ui/dialog';

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
    !!tree && confirmText.trim().normalize('NFC') === tree.name.normalize('NFC') && !isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteModal.title', { name: tree?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('deleteModal.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <DangerCell
            value={tree?.individualCount ?? 0}
            label={t('deleteModal.stats.individuals')}
          />
          <DangerCell value={tree?.familyCount ?? 0} label={t('deleteModal.stats.families')} />
          <DangerCell value="—" label={t('deleteModal.stats.sources')} />
          <DangerCell value="—" label={t('deleteModal.stats.media')} />
        </div>

        <label className="toggle-row mt-1.5 rounded-lg border border-border bg-foreground/[0.02] px-3.5 py-2.5">
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
          <div className="field mt-3.5">
            <label className="flabel" htmlFor="delete-confirm">
              <Trans
                t={t}
                i18nKey="deleteModal.typeToConfirm"
                values={{ name: tree.name }}
                components={{
                  code: (
                    <code className="rounded-[4px] bg-destructive/10 px-[6px] py-[1px] font-mono text-[12px] text-foreground" />
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

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {tc('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            aria-disabled={!canDelete}
            onClick={() => {
              if (!canDelete) return;
              onConfirm({ exportBefore });
            }}
          >
            <Trash2 strokeWidth={1.8} />
            {isPending ? t('deleteModal.deleting') : t('deleteModal.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DangerCell({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-card px-3.5 py-3">
      <div className="font-mono text-[18px] tabular-nums tracking-[-0.01em] text-destructive">
        {value}
      </div>
      <div className="mt-[2px] font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

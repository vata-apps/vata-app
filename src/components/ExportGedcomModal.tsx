import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GedcomManager } from '$/managers/GedcomManager';
import { openTreeDb } from '$/db/connection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '$components/ui/dialog';
import { Button } from '$components/ui/button';
import { Checkbox } from '$components/ui/checkbox';
import { Label } from '$components/ui/label';

interface ExportGedcomModalProps {
  isOpen: boolean;
  treeName: string;
  treePath: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExportGedcomModal({
  isOpen,
  treeName,
  treePath,
  onSuccess,
  onCancel,
}: ExportGedcomModalProps) {
  const { t } = useTranslation('home');
  const [includePrivate, setIncludePrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !treePath) return;

    let mounted = true;
    setReady(false);
    openTreeDb(treePath)
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        if (mounted) {
          setError(t('export.exportFailed', { error: e instanceof Error ? e.message : String(e) }));
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, treePath, t]);

  const reset = () => {
    setIncludePrivate(false);
    setLoading(false);
    setError(null);
    setReady(false);
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await GedcomManager.exportToFile(treeName, includePrivate);
      if (success) {
        reset();
        onSuccess();
      } else {
        setLoading(false);
      }
    } catch (e) {
      setError(t('export.exportFailed', { error: e instanceof Error ? e.message : String(e) }));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('export.description', { name: treeName })}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-living"
                checked={includePrivate}
                onCheckedChange={(checked) => setIncludePrivate(checked === true)}
              />
              <Label htmlFor="include-living" className="cursor-pointer">
                {t('export.includeLiving')}
              </Label>
            </div>
            <p className="ml-6 text-xs text-muted-foreground">{t('export.includeLivingHint')}</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button onClick={handleExport} disabled={loading || !ready}>
            {!ready
              ? t('status.loading', { ns: 'common' })
              : loading
                ? t('export.exporting')
                : t('actions.export', { ns: 'common' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

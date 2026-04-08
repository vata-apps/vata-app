import { useState } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { useTranslation } from 'react-i18next';
import { GedcomManager } from '$/managers/GedcomManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '$components/ui/dialog';
import { Button } from '$components/ui/button';

interface ImportGedcomModalProps {
  isOpen: boolean;
  onSuccess: (treeId: string) => void;
  onCancel: () => void;
}

interface PreviewStats {
  individuals: number;
  families: number;
}

export function ImportGedcomModal({ isOpen, onSuccess, onCancel }: ImportGedcomModalProps) {
  const { t } = useTranslation('home');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFilePath(null);
    setFileContent(null);
    setPreview(null);
    setLoading(false);
    setError(null);
  };

  const handleSelectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'GEDCOM', extensions: ['ged', 'gedcom'] }],
    });

    if (!selected) return;

    const path = selected as string;
    setFilePath(path);
    setError(null);
    setPreview(null);

    try {
      const content = await readTextFile(path);
      setFileContent(content);

      const validation = GedcomManager.validate(content);
      if (validation.valid) {
        setPreview({
          individuals: validation.stats.individuals,
          families: validation.stats.families,
        });
      } else {
        setError(validation.errors.join(', ') || t('import.invalidFile'));
      }
    } catch {
      setError(t('import.failedRead'));
    }
  };

  const handleImport = async () => {
    if (!fileContent || !filePath) return;

    setLoading(true);
    setError(null);

    try {
      const filename = filePath.split(/[\\/]/).pop() ?? t('import.defaultTreeName');
      const treeName = filename.replace(/\.[^.]+$/, '');

      const result = await GedcomManager.importFromContent(fileContent, treeName);
      reset();
      onSuccess(result.treeId);
    } catch (e) {
      setError(t('import.importFailed', { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const fileName = filePath?.split(/[\\/]/).pop();

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && !loading && handleCancel()}>
      <DialogContent
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Button variant="outline" onClick={handleSelectFile} disabled={loading}>
              {filePath ? t('import.changeFile') : t('import.selectFile')}
            </Button>
            {fileName && <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>}
          </div>

          {preview && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">{t('import.preview')}</p>
              <p className="text-sm text-muted-foreground">
                {t('import.previewStats', {
                  individuals: preview.individuals,
                  families: preview.families,
                })}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button onClick={handleImport} disabled={!preview || loading}>
            {loading ? t('import.importing') : t('import.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

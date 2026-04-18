import { useEffect, useState } from 'react';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import { useTranslation } from 'react-i18next';
import { ArrowRight, FileUp, Upload, X } from 'lucide-react';

import { GedcomManager } from '$/managers/GedcomManager';
import { cn } from '$lib/utils';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '$components/ui/dialog';

interface ImportGedcomModalProps {
  isOpen: boolean;
  onSuccess: (treeId: string) => void;
  onCancel: () => void;
}

interface ScanStats {
  individuals: number;
  families: number;
  sources: number;
}

interface SelectedFile {
  path: string;
  name: string;
  content: string;
  sizeLabel: string;
  gedcomVersion: string;
  encoding: string;
  errorsCount: number;
  warningsCount: number;
  stats: ScanStats | null;
  readOk: boolean;
  readErrorMessage?: string;
}

interface ImportOptions {
  importMedia: boolean;
  hideLiving: boolean;
}

const DEFAULT_OPTIONS: ImportOptions = {
  importMedia: true,
  hideLiving: false,
};

export function ImportGedcomModal({ isOpen, onSuccess, onCancel }: ImportGedcomModalProps) {
  const { t } = useTranslation('home');
  const { t: tc } = useTranslation('common');

  const [file, setFile] = useState<SelectedFile | null>(null);
  const [treeName, setTreeName] = useState('');
  const [options, setOptions] = useState<ImportOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setTreeName('');
      setOptions(DEFAULT_OPTIONS);
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  async function handlePickFile() {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'GEDCOM', extensions: ['ged', 'gedcom'] }],
    });
    if (!selected) return;

    const path = selected as string;
    const name = path.split(/[\\/]/).pop() ?? 'file.ged';

    setError(null);

    try {
      const content = await readTextFile(path);
      const validation = GedcomManager.validate(content);

      if (!validation.valid) {
        setFile({
          path,
          name,
          content,
          sizeLabel: formatSize(content.length),
          gedcomVersion: parseGedcomVersion(content),
          encoding: 'UTF-8',
          errorsCount: validation.errors.length,
          warningsCount: 0,
          stats: null,
          readOk: false,
          readErrorMessage: validation.errors.join(', ') || t('import.invalidFile'),
        });
        setTreeName(stripExtension(name));
        return;
      }

      setFile({
        path,
        name,
        content,
        sizeLabel: formatSize(content.length),
        gedcomVersion: parseGedcomVersion(content),
        encoding: 'UTF-8',
        errorsCount: 0,
        warningsCount: 0,
        stats: {
          individuals: validation.stats.individuals,
          families: validation.stats.families,
          sources: validation.stats.sources,
        },
        readOk: true,
      });
      setTreeName(stripExtension(name));
    } catch {
      setError(t('import.failedRead'));
    }
  }

  function handleRemoveFile() {
    setFile(null);
    setTreeName('');
    setError(null);
  }

  async function handleImport() {
    if (!file?.content || !file.readOk) return;
    const name = treeName.trim() || stripExtension(file.name) || t('import.defaultTreeName');

    setLoading(true);
    setError(null);
    try {
      const result = await GedcomManager.importFromContent(file.content, name);
      onSuccess(result.treeId);
    } catch (e) {
      setError(t('import.importFailed', { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;
    onCancel();
  }

  const canImport = Boolean(file?.readOk) && treeName.trim().length > 0 && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && handleCancel()}>
      <DialogContent
        className="max-w-[640px] gap-0 overflow-hidden p-0"
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-start gap-3.5 space-y-0 border-b border-border p-6 pb-4 text-left sm:text-left">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-chart-2/30 bg-chart-2/10 text-chart-2"
          >
            <FileUp className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-serif text-[22px] font-medium italic leading-tight tracking-tight">
              {t('import.title')}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed">
              {t('import.subtitle', { ext: '.ged' })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto px-6 pb-2 pt-5">
          {!file && (
            <>
              <button
                type="button"
                onClick={handlePickFile}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background/40 p-6 text-center transition-colors',
                  'hover:border-primary hover:bg-primary/5 focus-visible:border-primary focus-visible:bg-primary/5 focus-visible:outline-none'
                )}
              >
                <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                  <Upload className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13.5px] font-medium text-foreground">
                  {t('import.dropzone.prompt')}{' '}
                  <span className="text-primary underline decoration-[1px] underline-offset-2">
                    {t('import.dropzone.browse')}
                  </span>
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.04em] text-muted-foreground">
                  {t('import.dropzone.meta')}
                </span>
              </button>
              <div aria-hidden className="h-[18px]" />
            </>
          )}

          {file && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[9.5px] font-semibold tracking-wider',
                    file.readOk
                      ? 'border-chart-2/30 bg-chart-2/10 text-chart-2'
                      : 'border-destructive/40 bg-destructive/10 text-destructive'
                  )}
                >
                  GED
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                    {file.sizeLabel} · {file.gedcomVersion} · {file.encoding} ·{' '}
                    <span className={file.readOk ? 'text-chart-2' : 'text-destructive'}>
                      {file.readOk ? t('import.file.readOk') : t('import.file.readFailed')}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  aria-label={t('import.file.remove')}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {file.stats && (
                <div className="overflow-hidden rounded-lg border border-border bg-background/40">
                  <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                    <span>{t('import.scan.title')}</span>
                    <span className="flex-1" />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-2/25 bg-chart-2/10 px-2 py-[2px] font-mono text-[10.5px] normal-case tracking-[0.04em] text-chart-2">
                      <span className="h-1 w-1 rounded-full bg-chart-2" />
                      {t('import.scan.statusOk', {
                        errors: file.errorsCount,
                        warnings: file.warningsCount,
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-4">
                    <ScanCell
                      value={file.stats.individuals}
                      label={t('import.scan.labels.individuals')}
                    />
                    <ScanCell
                      value={file.stats.families}
                      label={t('import.scan.labels.families')}
                    />
                    <ScanCell value="—" label={t('import.scan.labels.generations')} last={false} />
                    <ScanCell
                      value={file.stats.sources}
                      label={t('import.scan.labels.sources')}
                      last
                    />
                  </div>
                </div>
              )}

              {!file.readOk && file.readErrorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {file.readErrorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="import-tree-name"
                  className="font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-muted-foreground"
                >
                  {t('import.treeName')}
                </label>
                <Input
                  id="import-tree-name"
                  value={treeName}
                  onChange={(e) => setTreeName(e.target.value)}
                  disabled={loading}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-muted-foreground">
                  {t('import.options.label')}
                </span>
                <div className="rounded-lg border border-border bg-background/40 px-3.5">
                  <ToggleRow
                    title={t('import.options.mergeDuplicates.title')}
                    hint={t('import.options.mergeDuplicates.hint')}
                    checked={false}
                    disabled
                    soonLabel={t('import.options.mergeDuplicates.soon')}
                    onChange={() => {}}
                  />
                  <ToggleRow
                    title={t('import.options.importMedia.title')}
                    hint={t('import.options.importMedia.hint')}
                    checked={options.importMedia}
                    disabled={loading}
                    onChange={(v) => setOptions((s) => ({ ...s, importMedia: v }))}
                  />
                  <ToggleRow
                    title={t('import.options.hideLiving.title')}
                    hint={t('import.options.hideLiving.hint')}
                    checked={options.hideLiving}
                    disabled={loading}
                    onChange={(v) => setOptions((s) => ({ ...s, hideLiving: v }))}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center gap-2.5 border-t border-border bg-muted/30 px-6 py-3.5 sm:justify-start sm:space-x-0">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
            {t('import.submitHint')}
          </span>
          <span className="flex-1" />
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="button" onClick={handleImport} disabled={!canImport}>
            <ArrowRight className="h-3.5 w-3.5" />
            {loading ? t('import.importing') : t('import.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ScanCellProps {
  value: number | string;
  label: string;
  last?: boolean;
}

function ScanCell({ value, label, last = false }: ScanCellProps) {
  return (
    <div className={cn('flex flex-col gap-1 px-3.5 py-2.5', !last && 'border-r border-border')}>
      <span className="font-mono text-[17px] font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

interface ToggleRowProps {
  title: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  soonLabel?: string;
  onChange: (value: boolean) => void;
}

function ToggleRow({ title, hint, checked, disabled, soonLabel, onChange }: ToggleRowProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 border-t border-dashed border-border py-3 first:border-t-0',
        disabled && 'opacity-60'
      )}
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          {title}
          {soonLabel && (
            <span className="rounded-full border border-border bg-muted/40 px-1.5 py-[1px] font-mono text-[9px] font-normal uppercase tracking-[0.08em] text-muted-foreground">
              {soonLabel}
            </span>
          )}
        </span>
        <span className="text-[11.5px] leading-snug text-muted-foreground">{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-1 h-[18px] w-8 shrink-0 rounded-full border border-border bg-muted/40 transition-colors',
          'disabled:cursor-not-allowed',
          checked && 'border-primary/50 bg-primary/30'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute left-px top-px block h-[14px] w-[14px] rounded-full bg-muted-foreground transition-transform',
            checked && 'translate-x-[14px] bg-primary'
          )}
        />
      </button>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseGedcomVersion(content: string): string {
  const match = content.match(/^\s*2\s+VERS\s+(\S+)/im);
  if (match) return `GEDCOM ${match[1]}`;
  return 'GEDCOM';
}

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

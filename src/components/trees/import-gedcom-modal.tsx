import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '$components/ui/badge';
import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { Dropzone } from '$components/ui/dropzone';
import { Input } from '$components/ui/input';
import { StatGrid, type StatGridItem } from '$components/ui/stat-grid';
import { Switch } from '$components/ui/switch';
import { GedcomManager, type ImportResult, type ScanResult } from '$/managers/GedcomManager';
import { formatBytes } from '$lib/format';
import { queryKeys } from '$lib/query-keys';

/**
 * In-memory description of the user's GEDCOM selection. The full
 * content is held in state because we already paid the read cost once
 * to scan it; re-reading at submit would mean a second Tauri IPC
 * round-trip for the same bytes.
 */
interface SelectedFile {
  path: string;
  name: string;
  content: string;
  size: number;
  scan: ScanResult;
}

/**
 * Props accepted by {@link ImportGedcomModal}.
 */
export interface ImportGedcomModalProps {
  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /** Called with the import result on success. */
  onImported?: (result: ImportResult) => void;

  /**
   * Override the import function. Defaults to
   * {@link GedcomManager.importFromContent}. Stories inject a spy here
   * to assert what the submit handler passes downstream.
   */
  importTree?: (content: string, treeName: string) => Promise<ImportResult>;

  /**
   * Pre-populates the modal with a selected file. Stories use this to
   * exercise the post-selection state without driving the Tauri file
   * dialog. Production code does not pass this prop.
   */
  initialSelection?: SelectedFile;
}

const defaultImportTree = (content: string, treeName: string): Promise<ImportResult> =>
  GedcomManager.importFromContent(content, treeName);

async function readGedcomFile(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

/**
 * Strip the extension and any leading directory off a filename to get
 * a sensible default tree name. Mirrors what `importFromFile` does
 * silently today.
 */
function deriveTreeName(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  return base.replace(/\.[^.]+$/, '');
}

/**
 * Form host for importing a GEDCOM file into a new tree. Wraps the
 * scan-preview-then-submit flow described in the home-page mockup.
 *
 * The modal owns its own error state — there is no inline error left
 * on the home page after this lands.
 */
export function ImportGedcomModal({
  open,
  onOpenChange,
  onImported,
  importTree = defaultImportTree,
  initialSelection,
}: ImportGedcomModalProps): JSX.Element {
  const { t } = useTranslation('trees');
  const queryClient = useQueryClient();
  const formId = useId();
  const nameId = useId();

  const [selected, setSelected] = useState<SelectedFile | null>(initialSelection ?? null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [name, setName] = useState(initialSelection ? deriveTreeName(initialSelection.name) : '');

  const mutation = useMutation({
    mutationFn: ({ content, treeName }: { content: string; treeName: string }) =>
      importTree(content, treeName),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      onImported?.(result);
      onOpenChange(false);
    },
    onError: (err) => {
      // Raw parser/Tauri errors are not translated — log them, surface a
      // generic localized message in the UI instead.
      console.error('Failed to import GEDCOM:', err);
    },
  });

  useEffect(() => {
    if (!open) {
      setSelected(initialSelection ?? null);
      setName(initialSelection ? deriveTreeName(initialSelection.name) : '');
      setScanError(null);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFileSelected = async (file: { path: string; name: string }): Promise<void> => {
    setScanError(null);
    try {
      const content = await readGedcomFile(file.path);
      setSelected({
        path: file.path,
        name: file.name,
        content,
        size: new TextEncoder().encode(content).length,
        scan: GedcomManager.scan(content),
      });
      setName(deriveTreeName(file.name));
    } catch (err) {
      // Raw parser/Tauri errors are not translated — log them, surface
      // a generic localized message in the UI instead.
      console.error('Failed to read or scan GEDCOM file:', err);
      setScanError(t('importGedcom.errorScan'));
    }
  };

  const trimmedName = name.trim();
  const hasFatalErrors = (selected?.scan.errors.length ?? 0) > 0;
  const canSubmit =
    selected !== null && trimmedName.length > 0 && !hasFatalErrors && !mutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit || !selected) return;
    mutation.mutate({ content: selected.content, treeName: trimmedName });
  };

  const closeModal = (): void => {
    if (mutation.isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        closeModal();
      }}
      size="lg"
      title={<span className="font-serif italic">{t('importGedcom.title')}</span>}
      description={t('importGedcom.subtitle')}
      closeLabel={t('importGedcom.closeLabel')}
      footerNote={<span className="font-mono">{t('importGedcom.footerNote')}</span>}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
            {t('importGedcom.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!canSubmit}>
            {t('importGedcom.submit')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!selected && (
          <Dropzone
            state={scanError ? 'error' : 'idle'}
            onFileSelected={handleFileSelected}
            formatName={t('importGedcom.dropzoneFormatName')}
            idleLabel={t('importGedcom.dropzoneLabel')}
            hint={t('importGedcom.dropzoneHint')}
            disabled={mutation.isPending}
          />
        )}

        {scanError && !selected && (
          <p role="alert" className="text-destructive text-sm">
            {scanError}
          </p>
        )}

        {selected && (
          <>
            <FileRow file={selected} onClear={() => setSelected(null)} />
            <ScanGrid scan={selected.scan} />

            {selected.scan.warnings.length > 0 && (
              <WarningList
                warnings={selected.scan.warnings}
                label={t('importGedcom.warningsLabel', { count: selected.scan.warnings.length })}
              />
            )}

            {selected.scan.errors.length > 0 && (
              <ErrorList errors={selected.scan.errors} label={t('importGedcom.errorsLabel')} />
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor={nameId} className="text-foreground text-sm font-medium">
                {t('importGedcom.nameLabel')}
              </label>
              <Input
                id={nameId}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('importGedcom.namePlaceholder')}
                disabled={mutation.isPending}
              />
            </div>

            <div className="border-border flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-foreground text-sm font-medium">
                {t('importGedcom.optionsLabel')}
              </span>
              <SoonSwitch label={t('importGedcom.mergeDuplicatesLabel')} />
              <SoonSwitch label={t('importGedcom.importMediaLabel')} />
              <SoonSwitch label={t('importGedcom.hideLivingLabel')} />
            </div>
          </>
        )}

        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t('importGedcom.errorGeneric')}
          </p>
        )}
      </form>
    </Dialog>
  );
}

interface FileRowProps {
  file: SelectedFile;
  onClear: () => void;
}

function FileRow({ file, onClear }: FileRowProps): JSX.Element {
  const { t } = useTranslation('trees');
  return (
    <div className="border-border flex items-center gap-3 rounded-lg border p-3">
      <Badge variant="primary" size="sm">
        {t('importGedcom.fileBadge')}
      </Badge>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-foreground text-sm font-medium">{file.name}</span>
        <span className="text-muted-foreground font-mono text-xs">
          {formatBytes(file.size)} · {t('importGedcom.fileEncoding')}
        </span>
      </div>
      <Button variant="ghost" size="sm" leadingIcon="x" hideLabel onClick={onClear}>
        {t('importGedcom.clearFileLabel')}
      </Button>
    </div>
  );
}

interface ScanGridProps {
  scan: ScanResult;
}

function ScanGrid({ scan }: ScanGridProps): JSX.Element {
  const { t } = useTranslation('trees');
  const items: StatGridItem[] = [
    { value: scan.individuals, label: t('importGedcom.scanIndividuals') },
    { value: scan.families, label: t('importGedcom.scanFamilies') },
    {
      value: scan.places,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t('importGedcom.scanPlaces')}
          <Badge variant="soon" size="sm">
            {t('importGedcom.soonLabel')}
          </Badge>
        </span>
      ),
    },
    { value: scan.sources, label: t('importGedcom.scanSources') },
  ];
  return <StatGrid items={items} />;
}

interface WarningListProps {
  warnings: string[];
  label: string;
}

function WarningList({ warnings, label }: WarningListProps): JSX.Element {
  return (
    <details className="border-warning/40 bg-warning/5 rounded-lg border p-3 text-sm">
      <summary className="text-warning cursor-pointer font-medium">{label}</summary>
      <ul className="text-muted-foreground mt-2 flex list-disc flex-col gap-1 pl-5">
        {warnings.map((message, idx) => (
          <li key={idx}>{message}</li>
        ))}
      </ul>
    </details>
  );
}

interface ErrorListProps {
  errors: string[];
  label: string;
}

function ErrorList({ errors, label }: ErrorListProps): JSX.Element {
  return (
    <div
      role="alert"
      className="border-destructive/40 bg-destructive/5 rounded-lg border p-3 text-sm"
    >
      <p className="text-destructive font-medium">{label}</p>
      <ul className="text-muted-foreground mt-2 flex list-disc flex-col gap-1 pl-5">
        {errors.map((message, idx) => (
          <li key={idx}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

interface SoonSwitchProps {
  label: string;
}

/**
 * Disabled switch with a `Soon` badge — visually present in the
 * options panel so the user sees future capability, but doesn't fool
 * them into thinking it has any effect today.
 */
function SoonSwitch({ label }: SoonSwitchProps): JSX.Element {
  const { t } = useTranslation('trees');
  return (
    <Switch
      checked={false}
      onCheckedChange={() => undefined}
      disabled
      label={
        <span className="inline-flex items-center gap-2">
          {label}
          <Badge variant="soon" size="sm">
            {t('importGedcom.soonLabel')}
          </Badge>
        </span>
      }
    />
  );
}

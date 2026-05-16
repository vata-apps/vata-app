import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes';

import { Dropzone } from '$components/dropzone';
import { Icon } from '$components/icon';
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
   * {@link GedcomManager.importFromContent}.
   */
  importTree?: (content: string, treeName: string) => Promise<ImportResult>;

  /**
   * Pre-populates the modal with a selected file. Tests use this to
   * exercise the post-selection state without driving the Tauri file
   * dialog. Production code does not pass this prop.
   */
  initialSelection?: SelectedFile;
}

/** Default `importTree` implementation — wraps `GedcomManager.importFromContent`. */
const defaultImportTree = (content: string, treeName: string): Promise<ImportResult> =>
  GedcomManager.importFromContent(content, treeName);

/**
 * Read a GEDCOM file's contents from disk via Tauri's filesystem
 * plugin. The plugin import is lazy so non-Tauri test contexts can
 * still load this module without resolving the native dependency.
 */
async function readGedcomFile(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

/**
 * Strip the extension and any leading directory off a filename to get
 * a sensible default tree name.
 */
function deriveTreeName(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  return base.replace(/\.[^.]+$/, '');
}

/**
 * Form host for importing a GEDCOM file into a new tree. Wraps the
 * scan-preview-then-submit flow.
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
  const [scanning, setScanning] = useState<string | null>(null);
  const [name, setName] = useState(initialSelection ? deriveTreeName(initialSelection.name) : '');

  // Bumped on every modal close. In-flight scans capture the value at
  // start and abort their writes if it changed by the time the read or
  // parse resolves.
  const scanIdRef = useRef(0);

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

  // Reset form state every time the modal closes. `initialSelection`
  // is intentionally omitted from the dep array — it's a test-only
  // seam that never changes mid-session.
  useEffect(() => {
    if (!open) {
      scanIdRef.current++;
      setSelected(initialSelection ?? null);
      setName(initialSelection ? deriveTreeName(initialSelection.name) : '');
      setScanError(null);
      setScanning(null);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFileSelected = async (file: { path: string; name: string }): Promise<void> => {
    const scanId = ++scanIdRef.current;
    setScanError(null);
    setScanning(file.name);
    try {
      const content = await readGedcomFile(file.path);
      if (scanId !== scanIdRef.current) return;
      // GedcomManager.scan is synchronous and can block the main thread
      // for hundreds of ms on large files. Yield once so React commits
      // the spinner frame before the parse starts.
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (scanId !== scanIdRef.current) return;
      setSelected({
        path: file.path,
        name: file.name,
        content,
        size: new TextEncoder().encode(content).length,
        scan: GedcomManager.scan(content),
      });
      setName(deriveTreeName(file.name));
    } catch (err) {
      if (scanId !== scanIdRef.current) return;
      // Raw parser/Tauri errors are not translated — log them, surface
      // a generic localized message in the UI instead.
      console.error('Failed to read or scan GEDCOM file:', err);
      setScanError(t('importGedcom.errorScan'));
    } finally {
      if (scanId === scanIdRef.current) setScanning(null);
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
    // Invalidate any in-flight scan synchronously so a read that
    // resolves between this click and the close-effect reset cannot
    // sneak a stale setSelected/setName onto the modal.
    scanIdRef.current++;
    onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        closeModal();
      }}
    >
      <Dialog.Content maxWidth="720px">
        <Dialog.Title>{t('importGedcom.title')}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t('importGedcom.subtitle')}
        </Dialog.Description>

        <form id={formId} onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            {!selected && (
              <Dropzone
                state={scanning ? 'scanning' : scanError ? 'error' : 'idle'}
                onFileSelected={handleFileSelected}
                formatName={t('importGedcom.dropzoneFormatName')}
                idleLabel={t('importGedcom.dropzoneLabel')}
                selectedName={
                  scanning ? t('importGedcom.dropzoneScanning', { name: scanning }) : undefined
                }
                hint={t('importGedcom.dropzoneHint')}
                disabled={mutation.isPending || scanning !== null}
              />
            )}

            {scanError && !selected && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{scanError}</Callout.Text>
              </Callout.Root>
            )}

            {selected && (
              <>
                <FileRow file={selected} onClear={() => setSelected(null)} />
                <ScanGrid scan={selected.scan} />

                {selected.scan.warnings.length > 0 && (
                  <WarningList
                    warnings={selected.scan.warnings}
                    label={t('importGedcom.warningsLabel', {
                      count: selected.scan.warnings.length,
                    })}
                  />
                )}

                {selected.scan.errors.length > 0 && (
                  <ErrorList errors={selected.scan.errors} label={t('importGedcom.errorsLabel')} />
                )}

                <Flex direction="column" gap="1">
                  <Text as="label" htmlFor={nameId} size="2" weight="medium">
                    {t('importGedcom.nameLabel')}
                  </Text>
                  <TextField.Root
                    id={nameId}
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t('importGedcom.namePlaceholder')}
                    disabled={mutation.isPending}
                  />
                </Flex>

                <Card>
                  <Flex direction="column" gap="2">
                    <Text size="2" weight="medium">
                      {t('importGedcom.optionsLabel')}
                    </Text>
                    <SoonSwitch label={t('importGedcom.mergeDuplicatesLabel')} />
                    <SoonSwitch label={t('importGedcom.importMediaLabel')} />
                    <SoonSwitch label={t('importGedcom.hideLivingLabel')} />
                  </Flex>
                </Card>
              </>
            )}

            {mutation.isError && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{t('importGedcom.errorGeneric')}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </form>

        <Flex gap="3" mt="4" justify="between" align="center">
          <Text size="1" color="gray">
            {t('importGedcom.footerNote')}
          </Text>
          <Flex gap="3">
            <Button variant="soft" color="gray" onClick={closeModal} disabled={mutation.isPending}>
              {t('importGedcom.cancel')}
            </Button>
            <Button type="submit" form={formId} disabled={!canSubmit}>
              {t('importGedcom.submit')}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Compact row summarising the selected file (badge, filename, size,
 * encoding) with a clear button that returns the modal to the
 * pre-selection state so the user can pick a different file.
 */
function FileRow({ file, onClear }: { file: SelectedFile; onClear: () => void }): JSX.Element {
  const { t } = useTranslation('trees');
  return (
    <Card>
      <Flex align="center" gap="3">
        <Badge>{t('importGedcom.fileBadge')}</Badge>
        <Flex direction="column" gap="1" flexGrow="1">
          <Text size="2" weight="medium">
            {file.name}
          </Text>
          <Text size="1" color="gray">
            {formatBytes(file.size)} · {t('importGedcom.fileEncoding')}
          </Text>
        </Flex>
        <IconButton
          variant="ghost"
          color="gray"
          onClick={onClear}
          aria-label={t('importGedcom.clearFileLabel')}
        >
          <Icon name="x" size={16} />
        </IconButton>
      </Flex>
    </Card>
  );
}

/**
 * Four-cell stat grid summarising the GEDCOM scan: individuals,
 * families, places (always 0 — see {@link ScanResult.places}), and
 * sources. The Places cell renders a `Soon` badge to set expectations.
 */
function ScanGrid({ scan }: { scan: ScanResult }): JSX.Element {
  const { t } = useTranslation('trees');
  const items: { value: number; label: React.ReactNode }[] = [
    { value: scan.individuals, label: t('importGedcom.scanIndividuals') },
    { value: scan.families, label: t('importGedcom.scanFamilies') },
    {
      value: scan.places,
      label: (
        <Flex align="center" gap="2" display="inline-flex">
          {t('importGedcom.scanPlaces')}
          <Badge variant="outline" color="gray">
            {t('importGedcom.soonLabel')}
          </Badge>
        </Flex>
      ),
    },
    { value: scan.sources, label: t('importGedcom.scanSources') },
  ];
  return (
    <Card>
      <Grid columns="4" gap="3">
        {items.map((item, idx) => (
          <Flex key={idx} direction="column" gap="1">
            <Text size="4" weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.value}
            </Text>
            <Text
              size="1"
              color="gray"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {item.label}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  );
}

/**
 * Collapsible list of non-fatal scan warnings. Renders inside a
 * `<details>` so the user can expand individual messages without the
 * panel dominating the modal when there are many warnings.
 */
function WarningList({ warnings, label }: { warnings: string[]; label: string }): JSX.Element {
  return (
    <Box
      asChild
      style={{
        border: '1px solid var(--amber-a5)',
        background: 'var(--amber-a2)',
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-3)',
      }}
    >
      <details>
        <summary style={{ cursor: 'pointer' }}>
          <Text size="2" weight="medium" color="amber">
            {label}
          </Text>
        </summary>
        <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
          {warnings.map((message, idx) => (
            <li key={idx}>
              <Text size="2" color="gray">
                {message}
              </Text>
            </li>
          ))}
        </ul>
      </details>
    </Box>
  );
}

/**
 * Always-visible list of fatal scan errors. Rendered as `role="alert"`
 * so assistive tech announces it; the modal's submit button stays
 * disabled while there are entries here.
 */
function ErrorList({ errors, label }: { errors: string[]; label: string }): JSX.Element {
  return (
    <Box
      role="alert"
      style={{
        border: '1px solid var(--red-a5)',
        background: 'var(--red-a2)',
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-3)',
      }}
    >
      <Text size="2" weight="medium" color="red">
        {label}
      </Text>
      <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
        {errors.map((message, idx) => (
          <li key={idx}>
            <Text size="2" color="gray">
              {message}
            </Text>
          </li>
        ))}
      </ul>
    </Box>
  );
}

/**
 * Disabled switch with a `Soon` badge — visually present in the
 * options panel so the user sees future capability without being
 * fooled into thinking it has any effect today.
 */
function SoonSwitch({ label }: { label: string }): JSX.Element {
  const { t } = useTranslation('trees');
  return (
    <Text as="label" size="2" color="gray">
      <Flex align="center" gap="2">
        <Switch disabled />
        {label}
        <Badge variant="outline" color="gray">
          {t('importGedcom.soonLabel')}
        </Badge>
      </Flex>
    </Text>
  );
}

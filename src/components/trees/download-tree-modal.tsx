import { useMutation } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '$components/ui/badge';
import { Button } from '$components/ui/button';
import { Dialog } from '$components/ui/dialog';
import { OptionCard, OptionCardGroup } from '$components/ui/option-card';
import { StatGrid, type StatGridItem } from '$components/ui/stat-grid';
import { Switch } from '$components/ui/switch';
import { GedcomManager } from '$/managers/GedcomManager';

/**
 * Lightweight projection of {@link Tree} carrying just what the modal
 * needs to render. Decoupled from the DB row so stories can build
 * fixtures without touching SQLite.
 */
export interface DownloadTreeTarget {
  id: string;
  name: string;
  individualCount: number;
  familyCount: number;
}

/**
 * Props accepted by {@link DownloadTreeModal}.
 */
export interface DownloadTreeModalProps {
  /** Tree to export. The modal renders nothing when null. */
  tree: DownloadTreeTarget | null;

  /** Whether the modal is open. Controlled by the parent. */
  open: boolean;

  /** Called when the modal should open or close. */
  onOpenChange: (open: boolean) => void;

  /**
   * Override the export function. Defaults to
   * {@link GedcomManager.exportToFile}. Tests/stories inject a spy
   * here so the flow can be exercised without hitting Tauri's save
   * dialog.
   */
  exportTree?: (treeName: string, includePrivate: boolean) => Promise<boolean>;
}

/** Default export — wraps `GedcomManager.exportToFile`. */
const defaultExportTree = (treeName: string, includePrivate: boolean): Promise<boolean> =>
  GedcomManager.exportToFile(treeName, includePrivate);

/**
 * Heuristic file-size estimate for the summary stat grid. Real export
 * size depends on the GEDCOM serialiser; this is just a rough
 * order-of-magnitude shown to the user.
 */
function estimateExportSize(individualCount: number, familyCount: number): string {
  const kb = individualCount * 0.5 + familyCount * 0.2;
  if (kb < 1) return '< 1 KB';
  if (kb < 1024) return `≈${kb.toFixed(0)} KB`;
  return `≈${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Form host for exporting a tree to a GEDCOM file. Cosmetic toggles
 * (sources, private notes, alternate formats, version select) render
 * with `Soon` badges — only "Hide living" is wired through to
 * `exportToFile`'s `includePrivate` argument today.
 */
export function DownloadTreeModal({
  tree,
  open,
  onOpenChange,
  exportTree = defaultExportTree,
}: DownloadTreeModalProps): JSX.Element | null {
  const { t } = useTranslation('trees');
  const formId = useId();

  const [hideLiving, setHideLiving] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ treeName, includePrivate }: { treeName: string; includePrivate: boolean }) =>
      exportTree(treeName, includePrivate),
    onSuccess: (saved) => {
      if (saved) onOpenChange(false);
    },
    onError: (err) => {
      // Raw Tauri/serialiser errors are not translated — log them,
      // surface a generic localized message in the UI instead.
      console.error('Failed to export GEDCOM:', err);
    },
  });

  useEffect(() => {
    if (!open) {
      setHideLiving(false);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!tree) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate({ treeName: tree.name, includePrivate: !hideLiving });
  };

  const closeModal = (): void => {
    if (mutation.isPending) return;
    onOpenChange(false);
  };

  const statItems: StatGridItem[] = [
    {
      value: tree.individualCount.toLocaleString(),
      label: t('downloadTree.summaryIndividuals'),
    },
    { value: tree.familyCount.toLocaleString(), label: t('downloadTree.summaryFamilies') },
    {
      value: estimateExportSize(tree.individualCount, tree.familyCount),
      label: t('downloadTree.summaryEstimatedSize'),
    },
  ];

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
      size="md"
      title={<span className="font-serif italic">{t('downloadTree.title')}</span>}
      description={t('downloadTree.subtitle', { treeName: tree.name })}
      closeLabel={t('downloadTree.closeLabel')}
      footerNote={<span className="font-mono">{t('downloadTree.footerNote')}</span>}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal} disabled={mutation.isPending}>
            {t('downloadTree.cancel')}
          </Button>
          <Button type="submit" form={formId} leadingIcon="download" disabled={mutation.isPending}>
            {t('downloadTree.submit')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">
            {t('downloadTree.formatLabel')}
          </span>
          <OptionCardGroup
            value="gedcom"
            onValueChange={() => undefined}
            aria-label={t('downloadTree.formatLabel')}
            cols={3}
          >
            <OptionCard
              value="gedcom"
              label={t('downloadTree.formatGedcomLabel')}
              description={t('downloadTree.formatGedcomDescription')}
            />
            <OptionCard
              value="vata"
              label={t('downloadTree.formatVataLabel')}
              description={t('downloadTree.formatVataDescription')}
              soon
              soonLabel={t('downloadTree.soonLabel')}
            />
            <OptionCard
              value="zip"
              label={t('downloadTree.formatZipLabel')}
              description={t('downloadTree.formatZipDescription')}
              soon
              soonLabel={t('downloadTree.soonLabel')}
            />
          </OptionCardGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
            {t('downloadTree.versionLabel')}
            <Badge variant="soon" size="sm">
              {t('downloadTree.soonLabel')}
            </Badge>
          </span>
          <input
            type="text"
            disabled
            value={t('downloadTree.versionPlaceholder')}
            readOnly
            className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 font-mono text-sm"
            aria-label={t('downloadTree.versionLabel')}
          />
        </div>

        <div className="border-border flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-foreground text-sm font-medium">
            {t('downloadTree.optionsLabel')}
          </span>
          <SoonSwitch label={t('downloadTree.includeSourcesLabel')} />
          <Switch
            checked={hideLiving}
            onCheckedChange={setHideLiving}
            label={t('downloadTree.hideLivingLabel')}
            disabled={mutation.isPending}
          />
          <SoonSwitch label={t('downloadTree.includePrivateNotesLabel')} />
        </div>

        <div className="border-border bg-muted/30 rounded-lg border p-4">
          <StatGrid items={statItems} cols={3} />
        </div>

        {mutation.isError && (
          <p role="alert" className="text-destructive text-sm">
            {t('downloadTree.errorGeneric')}
          </p>
        )}
      </form>
    </Dialog>
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
            {t('downloadTree.soonLabel')}
          </Badge>
        </span>
      }
    />
  );
}

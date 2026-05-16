import { useMutation } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Grid,
  Select,
  Switch,
  Text,
} from '@radix-ui/themes';

import { Icon } from '$components/icon';
import { GedcomManager } from '$/managers/GedcomManager';

/**
 * Lightweight projection of {@link Tree} carrying just what the modal
 * needs to render. Decoupled from the DB row so tests can build
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
   * {@link GedcomManager.exportToFile}.
   */
  exportTree?: (treeName: string, includePrivate: boolean) => Promise<boolean>;
}

/** Default export — wraps `GedcomManager.exportToFile`. */
const defaultExportTree = (treeName: string, includePrivate: boolean): Promise<boolean> =>
  GedcomManager.exportToFile(treeName, includePrivate);

/** A localized estimate of the exported file size, bucketed by magnitude. */
type SizeEstimate =
  | { bucket: 'under-kb' }
  | { bucket: 'kb'; value: string }
  | { bucket: 'mb'; value: string };

/**
 * Heuristic file-size estimate for the summary stat grid. Real export
 * size depends on the GEDCOM serialiser; this is just a rough
 * order-of-magnitude shown to the user.
 */
function estimateExportSize(individualCount: number, familyCount: number): SizeEstimate {
  const kb = individualCount * 0.5 + familyCount * 0.2;
  if (kb < 1) return { bucket: 'under-kb' };
  if (kb < 1024) return { bucket: 'kb', value: kb.toFixed(0) };
  return { bucket: 'mb', value: (kb / 1024).toFixed(1) };
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

  const sizeEstimate = estimateExportSize(tree.individualCount, tree.familyCount);
  const sizeKey =
    sizeEstimate.bucket === 'under-kb'
      ? 'downloadTree.sizeUnderKb'
      : sizeEstimate.bucket === 'kb'
        ? 'downloadTree.sizeKb'
        : 'downloadTree.sizeMb';
  const sizeValue = sizeEstimate.bucket === 'under-kb' ? '' : sizeEstimate.value;

  const stats: { value: string; label: string }[] = [
    { value: tree.individualCount.toLocaleString(), label: t('downloadTree.summaryIndividuals') },
    { value: tree.familyCount.toLocaleString(), label: t('downloadTree.summaryFamilies') },
    { value: t(sizeKey, { value: sizeValue }), label: t('downloadTree.summaryEstimatedSize') },
  ];

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
      <Dialog.Content maxWidth="520px">
        <Dialog.Title>{t('downloadTree.title')}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          {t('downloadTree.subtitle', { treeName: tree.name })}
        </Dialog.Description>

        <form id={formId} onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium">
                {t('downloadTree.formatLabel')}
              </Text>
              <Grid columns="3" gap="2">
                <FormatCard
                  label={t('downloadTree.formatGedcomLabel')}
                  description={t('downloadTree.formatGedcomDescription')}
                  selected
                />
                <FormatCard
                  label={t('downloadTree.formatVataLabel')}
                  description={t('downloadTree.formatVataDescription')}
                  soonLabel={t('downloadTree.soonLabel')}
                />
                <FormatCard
                  label={t('downloadTree.formatZipLabel')}
                  description={t('downloadTree.formatZipDescription')}
                  soonLabel={t('downloadTree.soonLabel')}
                />
              </Grid>
            </Flex>

            <Flex direction="column" gap="1">
              <Flex align="center" gap="2">
                <Text size="2" weight="medium">
                  {t('downloadTree.versionLabel')}
                </Text>
                <Badge variant="outline" color="gray">
                  {t('downloadTree.soonLabel')}
                </Badge>
              </Flex>
              <Select.Root disabled defaultValue="placeholder">
                <Select.Trigger aria-label={t('downloadTree.versionLabel')} />
                <Select.Content>
                  <Select.Item value="placeholder">
                    {t('downloadTree.versionPlaceholder')}
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Card>
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">
                  {t('downloadTree.optionsLabel')}
                </Text>
                <SoonSwitch label={t('downloadTree.includeSourcesLabel')} />
                <Text as="label" size="2">
                  <Flex align="center" gap="2">
                    <Switch
                      checked={hideLiving}
                      onCheckedChange={setHideLiving}
                      disabled={mutation.isPending}
                    />
                    {t('downloadTree.hideLivingLabel')}
                  </Flex>
                </Text>
                <SoonSwitch label={t('downloadTree.includePrivateNotesLabel')} />
              </Flex>
            </Card>

            <Card>
              <Grid columns="3" gap="3">
                {stats.map((stat, idx) => (
                  <Flex key={idx} direction="column" gap="1">
                    <Text size="4" weight="medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {stat.value}
                    </Text>
                    <Text
                      size="1"
                      color="gray"
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {stat.label}
                    </Text>
                  </Flex>
                ))}
              </Grid>
            </Card>

            {mutation.isError && (
              <Callout.Root color="red" size="1" role="alert">
                <Callout.Text>{t('downloadTree.errorGeneric')}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        </form>

        <Flex gap="3" mt="4" justify="between" align="center">
          <Text size="1" color="gray">
            {t('downloadTree.footerNote')}
          </Text>
          <Flex gap="3">
            <Button variant="soft" color="gray" onClick={closeModal} disabled={mutation.isPending}>
              {t('downloadTree.cancel')}
            </Button>
            <Button type="submit" form={formId} disabled={mutation.isPending}>
              <Icon name="download" size={16} />
              {t('downloadTree.submit')}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * One format option in the export format grid. The GEDCOM card is the
 * only selectable one today; the rest render a `Soon` badge and a
 * dimmed, non-interactive look.
 */
function FormatCard({
  label,
  description,
  selected,
  soonLabel,
}: {
  label: string;
  description: string;
  selected?: boolean;
  soonLabel?: string;
}): JSX.Element {
  return (
    <Card variant={selected ? 'surface' : 'classic'} style={{ opacity: soonLabel ? 0.6 : 1 }}>
      <Flex direction="column" align="start" gap="1">
        <Flex align="center" gap="2">
          <Text size="2" weight="medium">
            {label}
          </Text>
          {soonLabel && (
            <Badge variant="outline" color="gray">
              {soonLabel}
            </Badge>
          )}
        </Flex>
        <Text size="1" color="gray">
          {description}
        </Text>
      </Flex>
    </Card>
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
          {t('downloadTree.soonLabel')}
        </Badge>
      </Flex>
    </Text>
  );
}

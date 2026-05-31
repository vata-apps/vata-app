import { type ReactNode } from 'react';
import { Box, Button, Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';

import { Icon, type IconName } from '$components/icon';

/**
 * Stats shown in the card body.
 */
export interface TreeCardStats {
  individuals: number;
  families: number;
  /** Optional generation count when computed. */
  generations?: number | null;
}

/**
 * Metadata shown in the card body. Values are pre-formatted by the caller.
 */
export interface TreeCardMeta {
  /** Formatted "created at" value (e.g., a localised date string). */
  createdAt: ReactNode;
  /** Formatted "last accessed" value. */
  lastAccessedAt: ReactNode;
}

/**
 * Localized labels rendered inside the card. Required so the component
 * does not own copy.
 */
export interface TreeCardLabels {
  open: string;
  export: string;
  edit: string;
  delete: string;
  individuals: string;
  families: string;
  generations: string;
  createdAt: string;
  lastAccessedAt: string;
}

/**
 * Props accepted by {@link TreeCard}.
 */
export interface TreeCardProps {
  /** Tree name shown as the card heading. */
  name: ReactNode;
  /** Optional tree description. */
  description?: ReactNode;
  /** Counts displayed in the stats row. */
  stats: TreeCardStats;
  /** Created/last-accessed metadata. */
  meta: TreeCardMeta;
  /** Localized labels for stats, metadata keys, and action buttons. */
  labels: TreeCardLabels;
  /** Called when the user clicks "Open". */
  onOpen: () => void;
  /** Called when the user clicks "Export". */
  onExport: () => void;
  /** Called when the user clicks "Edit". */
  onEdit: () => void;
  /** Called when the user clicks "Delete". */
  onDelete: () => void;
}

/**
 * One stat in the card body — a large tabular number above a small
 * uppercase mono label (e.g. the individual or family count).
 */
function Stat({ value, label }: { value: ReactNode; label: ReactNode }): JSX.Element {
  return (
    <Flex direction="column" gap="2">
      <Text
        style={{
          fontSize: 30,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Text>
      <Text size="1" color="gray">
        {label}
      </Text>
    </Flex>
  );
}

/**
 * One metadata row in the card body — a fixed-width label beside a
 * tabular-numeric value, both in mono (e.g. "Created" / a date).
 */
function MetaRow({ label, value }: { label: ReactNode; value: ReactNode }): JSX.Element {
  return (
    <Flex gap="3" style={{ fontFamily: 'var(--code-font-family)', fontSize: 12.5 }}>
      <Text style={{ width: 110, flex: 'none', color: 'var(--gray-a10)' }}>{label}</Text>
      <Text style={{ color: 'var(--gray-12)', fontVariantNumeric: 'tabular-nums' }}>{value}</Text>
    </Flex>
  );
}

/**
 * One ghost icon action in the card's action row, sized to a 40px
 * square — the height of the size-3 Open button. A ghost IconButton
 * otherwise hugs its icon and carries negative margins, so the box is
 * set explicitly and `margin: 0` keeps the row's Flex gap intact.
 */
function CardIconAction({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <IconButton
      variant="ghost"
      size="3"
      onClick={onClick}
      aria-label={label}
      style={{ width: 40, height: 40, padding: 0, margin: 0 }}
    >
      <Icon name={icon} size={16} />
    </IconButton>
  );
}

/**
 * Domain card representing one family tree on the home page.
 *
 * Composes Radix Themes primitives (Card, Button, IconButton) but has
 * its own genealogy-domain data shape and call sites. For the "Add a
 * new tree" tile, use {@link TreeCardCta} instead.
 *
 * All textual content (name, description, button labels, meta) must be
 * localized by the caller; this component does not own copy.
 */
export function TreeCard({
  name,
  description,
  stats,
  meta,
  labels,
  onOpen,
  onExport,
  onEdit,
  onDelete,
}: TreeCardProps): JSX.Element {
  return (
    <Card asChild variant="surface" size="3" style={{ minHeight: 240 }}>
      <article>
        <Flex direction="column" gap="4" height="100%">
          <Box>
            <Heading as="h2" size="6" weight="regular" truncate>
              {name}
            </Heading>
            <Text
              as="p"
              size="2"
              color="gray"
              mt="2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                // Always reserve two lines so cards align on a shared grid.
                minHeight: 'calc(2 * 1.5 * var(--font-size-2))',
              }}
            >
              {description}
            </Text>
          </Box>

          <Flex gap="6">
            <Stat value={stats.individuals} label={labels.individuals} />
            <Stat value={stats.families} label={labels.families} />
            {stats.generations != null && (
              <Stat value={stats.generations} label={labels.generations} />
            )}
          </Flex>

          <Box>
            <Box mb="3" style={{ height: 0, borderTop: '1px dashed var(--gray-a6)' }} />
            <Flex direction="column" gap="1">
              <MetaRow label={labels.createdAt} value={meta.createdAt} />
              <MetaRow label={labels.lastAccessedAt} value={meta.lastAccessedAt} />
            </Flex>
          </Box>

          <Flex align="center" gap="3" pt="1" style={{ marginTop: 'auto' }}>
            <Button variant="soft" size="3" onClick={onOpen} style={{ flex: 1 }}>
              <Icon name="folder-open" size={16} />
              {labels.open}
              <Icon name="arrow-right" size={16} />
            </Button>
            <CardIconAction icon="download" label={labels.export} onClick={onExport} />
            <CardIconAction icon="pencil" label={labels.edit} onClick={onEdit} />
            <CardIconAction icon="trash" label={labels.delete} onClick={onDelete} />
          </Flex>
        </Flex>
      </article>
    </Card>
  );
}

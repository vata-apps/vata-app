import { type ReactNode } from 'react';
import { Box, Button, Card, Flex, Heading, IconButton, Separator, Text } from '@radix-ui/themes';

import { Icon } from '$components/icon';

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

function Stat({ value, label }: { value: ReactNode; label: ReactNode }): JSX.Element {
  return (
    <Flex direction="column" gap="1">
      <Text size="5" weight="bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      <Text
        size="1"
        weight="medium"
        style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-a10)' }}
      >
        {label}
      </Text>
    </Flex>
  );
}

function MetaRow({ label, value }: { label: ReactNode; value: ReactNode }): JSX.Element {
  return (
    <Flex gap="2" align="center">
      <Text size="1" style={{ width: 120, flex: 'none', color: 'var(--gray-a10)' }}>
        {label}
      </Text>
      <Text size="1" color="gray" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Flex>
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
    <Card asChild variant="surface" style={{ minHeight: 220 }}>
      <article>
        <Flex direction="column" gap="3" height="100%">
          <Box>
            <Heading size="4" weight="medium" truncate>
              {name}
            </Heading>
            {description && (
              <Text
                as="p"
                size="2"
                color="gray"
                mt="1"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </Text>
            )}
          </Box>

          <Flex align="center" gap="3">
            <Stat value={stats.individuals} label={labels.individuals} />
            <Separator orientation="vertical" size="2" />
            <Stat value={stats.families} label={labels.families} />
            {stats.generations != null && (
              <>
                <Separator orientation="vertical" size="2" />
                <Stat value={stats.generations} label={labels.generations} />
              </>
            )}
          </Flex>

          <Box>
            <Separator size="4" mb="2" />
            <Flex direction="column" gap="1">
              <MetaRow label={labels.createdAt} value={meta.createdAt} />
              <MetaRow label={labels.lastAccessedAt} value={meta.lastAccessedAt} />
            </Flex>
          </Box>

          <Flex align="center" gap="3" pt="1" style={{ marginTop: 'auto' }}>
            <Button variant="outline" color="gray" onClick={onOpen} style={{ flex: 1 }}>
              <Icon name="folder-open" size={14} />
              {labels.open}
              <Icon name="arrow-right" size={14} />
            </Button>
            <IconButton variant="ghost" color="gray" onClick={onExport} aria-label={labels.export}>
              <Icon name="download" size={14} />
            </IconButton>
            <IconButton variant="ghost" color="gray" onClick={onEdit} aria-label={labels.edit}>
              <Icon name="pencil" size={14} />
            </IconButton>
            <IconButton
              variant="ghost"
              color="gray"
              onClick={onDelete}
              aria-label={labels.delete}
              // Cancel the ghost variant's -6px right margin so the row ends
              // flush with the card padding, matching the left edge.
              style={{ marginRight: 0 }}
            >
              <Icon name="trash" size={14} />
            </IconButton>
          </Flex>
        </Flex>
      </article>
    </Card>
  );
}

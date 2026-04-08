import { Link } from '@tanstack/react-router';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { useEventTimeline } from '$hooks/useEventTimeline';
import { getEventTypeLabel } from '$lib/event-type-labels';
import { getCurrentTreePath } from '$/db/connection';
import type { EventTimelineEntry, EventTimelineThumbnail } from '$/types/database';

interface EventTimelineProps {
  treeId: string;
  individualId: string;
}

const MAX_THUMBNAILS = 3;

function ThumbnailImage({
  thumb,
  treeId,
  treePath,
}: {
  thumb: EventTimelineThumbnail;
  treeId: string;
  treePath: string;
}): JSX.Element {
  const src = convertFileSrc(`${treePath}/${thumb.thumbnailPath}`);

  return (
    <Link
      to="/tree/$treeId/source/$sourceId/edit"
      params={{ treeId, sourceId: thumb.sourceId }}
      title={thumb.sourceTitle}
      className="inline-block leading-none"
    >
      <img
        src={src}
        alt={thumb.originalFilename}
        className="h-12 rounded border border-border object-cover"
      />
    </Link>
  );
}

function TimelineRow({
  entry,
  treeId,
  treePath,
}: {
  entry: EventTimelineEntry;
  treeId: string;
  treePath: string | null;
}): JSX.Element {
  const { t } = useTranslation('common');
  const label = getEventTypeLabel(entry.eventType);
  const displayThumbnails = entry.thumbnails.slice(0, MAX_THUMBNAILS);
  const extraCount = entry.thumbnails.length - MAX_THUMBNAILS;

  return (
    <div className="flex items-start gap-4 border-b border-border py-2">
      <div className="min-w-0 flex-1">
        <div>
          <span className="font-semibold">{label}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {entry.dateOriginal ?? t('timeline.noDate')}
          {entry.place && <> — {entry.place.fullName}</>}
        </div>
        {!entry.hasCitations && (
          <Link
            to="/tree/$treeId/sources"
            params={{ treeId }}
            className="text-xs text-muted-foreground underline"
          >
            {t('timeline.addSource')}
          </Link>
        )}
      </div>

      {treePath && displayThumbnails.length > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          {displayThumbnails.map((thumb) => (
            <ThumbnailImage key={thumb.fileId} thumb={thumb} treeId={treeId} treePath={treePath} />
          ))}
          {extraCount > 0 && <span className="text-xs text-muted-foreground">+{extraCount}</span>}
        </div>
      )}
    </div>
  );
}

export function EventTimeline({ treeId, individualId }: EventTimelineProps): JSX.Element {
  const { t } = useTranslation('common');
  const { data: entries, isLoading, isError } = useEventTimeline(individualId);
  const treePath = getCurrentTreePath();

  if (isLoading) {
    return <p className="text-muted-foreground">{t('timeline.loading')}</p>;
  }

  if (isError) {
    return <p className="text-destructive">{t('timeline.error')}</p>;
  }

  if (!entries || entries.length === 0) {
    return <p className="text-muted-foreground">{t('timeline.empty')}</p>;
  }

  return (
    <div>
      {entries.map((entry) => (
        <TimelineRow key={entry.id} entry={entry} treeId={treeId} treePath={treePath} />
      ))}
    </div>
  );
}

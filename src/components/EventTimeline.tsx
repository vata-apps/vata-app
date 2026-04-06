import { Link } from '@tanstack/react-router';
import { convertFileSrc } from '@tauri-apps/api/core';
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
      style={{ display: 'inline-block', lineHeight: 0 }}
    >
      <img
        src={src}
        alt={thumb.originalFilename}
        style={{
          height: '48px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          objectFit: 'cover',
        }}
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
  const label = getEventTypeLabel(entry.eventType);
  const displayThumbnails = entry.thumbnails.slice(0, MAX_THUMBNAILS);
  const extraCount = entry.thumbnails.length - MAX_THUMBNAILS;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>
          <strong>{label}</strong>
        </div>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          {entry.dateOriginal ?? '(no date)'}
          {entry.place && <> — {entry.place.fullName}</>}
        </div>
        {!entry.hasCitations && (
          <Link
            to="/tree/$treeId/sources"
            params={{ treeId }}
            style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'underline' }}
          >
            Add source
          </Link>
        )}
      </div>

      {treePath && displayThumbnails.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
          {displayThumbnails.map((thumb) => (
            <ThumbnailImage key={thumb.fileId} thumb={thumb} treeId={treeId} treePath={treePath} />
          ))}
          {extraCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#888' }}>+{extraCount}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function EventTimeline({ treeId, individualId }: EventTimelineProps): JSX.Element {
  const { data: entries, isLoading, isError } = useEventTimeline(individualId);
  const treePath = getCurrentTreePath();

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading events...</p>;
  }

  if (isError) {
    return <p style={{ color: '#c00' }}>Failed to load events.</p>;
  }

  if (!entries || entries.length === 0) {
    return <p style={{ color: '#666' }}>No events recorded.</p>;
  }

  return (
    <div>
      {entries.map((entry) => (
        <TimelineRow key={entry.id} entry={entry} treeId={treeId} treePath={treePath} />
      ))}
    </div>
  );
}

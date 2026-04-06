import { getTreeDb } from '../connection';
import { parseEntityId, formatEntityId } from '$/lib/entityId';
import { getEventsByIndividualIdWithDetails } from './events';
import type { EventTimelineEntry, EventTimelineThumbnail } from '$/types/database';

interface RawCitationSource {
  event_id: number;
  source_id: number;
  source_title: string;
}

interface RawSourceThumbnail {
  source_id: number;
  file_id: number;
  thumbnail_path: string;
  original_filename: string;
}

/**
 * Get all events for an individual, enriched with source media thumbnails.
 * Uses a layered query approach:
 * 1. Get events with details (reuses existing function)
 * 2. Batch-fetch citation sources for those events
 * 3. Batch-fetch files with thumbnails for those sources
 */
export async function getEventTimelineForIndividual(
  individualId: string
): Promise<EventTimelineEntry[]> {
  const events = await getEventsByIndividualIdWithDetails(individualId);

  if (events.length === 0) {
    return [];
  }

  const db = await getTreeDb();

  // Step 2: Get citation sources for all events
  const eventDbIds = events.map((e) => parseEntityId(e.id));
  const placeholders = eventDbIds.map((_, i) => `$${i + 1}`).join(', ');

  const citationRows = await db.select<RawCitationSource[]>(
    `SELECT DISTINCT cl.entity_id AS event_id, s.id AS source_id, s.title AS source_title
     FROM citation_links cl
     JOIN source_citations sc ON sc.id = cl.citation_id
     JOIN sources s ON s.id = sc.source_id
     WHERE cl.entity_type = 'event'
       AND cl.entity_id IN (${placeholders})`,
    eventDbIds
  );

  // Build map: eventDbId -> { sourceId, sourceTitle }[]
  const eventSourceMap = new Map<number, { sourceId: number; sourceTitle: string }[]>();
  for (const row of citationRows) {
    const list = eventSourceMap.get(row.event_id) ?? [];
    list.push({ sourceId: row.source_id, sourceTitle: row.source_title });
    eventSourceMap.set(row.event_id, list);
  }

  // Step 3: Get files with thumbnails for all sources
  const allSourceIds = [...new Set(citationRows.map((r) => r.source_id))];

  const sourceThumbnailMap = new Map<number, RawSourceThumbnail[]>();

  if (allSourceIds.length > 0) {
    const srcPlaceholders = allSourceIds.map((_, i) => `$${i + 1}`).join(', ');

    const thumbnailRows = await db.select<RawSourceThumbnail[]>(
      `SELECT sf.source_id, f.id AS file_id, f.thumbnail_path, f.original_filename
       FROM source_files sf
       JOIN files f ON f.id = sf.file_id
       WHERE sf.source_id IN (${srcPlaceholders})
         AND f.thumbnail_path IS NOT NULL
       ORDER BY sf.sort_order`,
      allSourceIds
    );

    for (const row of thumbnailRows) {
      const list = sourceThumbnailMap.get(row.source_id) ?? [];
      list.push(row);
      sourceThumbnailMap.set(row.source_id, list);
    }
  }

  // Step 4: Assemble EventTimelineEntry[]
  return events.map((event) => {
    const eventDbId = parseEntityId(event.id);
    const sources = eventSourceMap.get(eventDbId) ?? [];
    const hasCitations = sources.length > 0;

    const thumbnails: EventTimelineThumbnail[] = [];
    for (const src of sources) {
      const files = sourceThumbnailMap.get(src.sourceId) ?? [];
      for (const file of files) {
        thumbnails.push({
          fileId: String(file.file_id),
          thumbnailPath: file.thumbnail_path,
          originalFilename: file.original_filename,
          sourceId: formatEntityId('S', src.sourceId),
          sourceTitle: src.sourceTitle,
        });
      }
    }

    return {
      ...event,
      thumbnails,
      hasCitations,
    };
  });
}

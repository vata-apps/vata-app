import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type { CitationDetail } from '$/types/database';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

interface RawCitationRow {
  citation_id: number;
  page: string | null;
  event_id: number | null;
  event_type_name: string | null;
  event_date: string | null;
}

interface RawIndividualRow {
  citation_id: number;
  individual_id: number;
  given_names: string | null;
  surname: string | null;
}

// =============================================================================
// Query
// =============================================================================

/**
 * Get citation details for a source.
 *
 * Returns one CitationDetail per citation, with event info and all linked
 * individuals (aggregated from event_participants and direct citation_links).
 * Individuals linked via both routes are deduplicated.
 */
export async function getCitationDetailsForSource(sourceId: string): Promise<CitationDetail[]> {
  const db = await getTreeDb();
  const sourceDbId = parseEntityId(sourceId);

  // Step 1: get all citations for this source, with optional event details
  // A citation may link to an event via citation_links (entity_type = 'event').
  // COALESCE(et.custom_name, et.tag) gives the human-readable event type name
  // for both system types (tag non-null, custom_name null) and
  // custom types (custom_name non-null, tag null).
  const citationRows = await db.select<RawCitationRow[]>(
    `SELECT
       sc.id                                    AS citation_id,
       sc.page                                  AS page,
       e.id                                     AS event_id,
       COALESCE(et.custom_name, et.tag)         AS event_type_name,
       e.date_original                          AS event_date
     FROM source_citations sc
     LEFT JOIN citation_links cl_event
       ON cl_event.citation_id = sc.id
       AND cl_event.entity_type = 'event'
     LEFT JOIN events e
       ON e.id = cl_event.entity_id
     LEFT JOIN event_types et
       ON et.id = e.event_type_id
     WHERE sc.source_id = $1
     ORDER BY sc.id`,
    [sourceDbId]
  );

  if (citationRows.length === 0) {
    return [];
  }

  const citationDbIds = citationRows.map((r) => r.citation_id);

  // Step 2: collect all individuals linked to these citations.
  // An individual can be linked via:
  //   (a) a direct citation_link of entity_type = 'individual', or
  //   (b) event_participants for the event linked to the citation.
  // We gather both sets and deduplicate per citation.

  // (a) Direct individual links
  const directRows = await db.select<RawIndividualRow[]>(
    `SELECT
       cl.citation_id                           AS citation_id,
       i.id                                     AS individual_id,
       n.given_names                            AS given_names,
       n.surname                                AS surname
     FROM citation_links cl
     JOIN individuals i
       ON i.id = cl.entity_id
     LEFT JOIN names n
       ON n.individual_id = i.id
       AND n.is_primary = 1
     WHERE cl.citation_id IN (${citationDbIds.map((_, idx) => `$${idx + 1}`).join(', ')})
       AND cl.entity_type = 'individual'
     ORDER BY cl.citation_id, i.id`,
    citationDbIds
  );

  // (b) Individuals linked via the event (event_participants)
  // Only for citations that have an event link
  const eventLinkedCitations = citationRows.filter((r) => r.event_id !== null);
  let participantRows: RawIndividualRow[] = [];

  if (eventLinkedCitations.length > 0) {
    // Build a mapping: event_id → citation_id (we know there is at most one
    // event per citation from the query above)
    const eventIds = eventLinkedCitations.map((r) => r.event_id as number);
    const eventIdToCitationId = new Map<number, number>(
      eventLinkedCitations.map((r) => [r.event_id as number, r.citation_id])
    );

    const rawParticipants = await db.select<
      {
        event_id: number;
        individual_id: number;
        given_names: string | null;
        surname: string | null;
      }[]
    >(
      `SELECT
         ep.event_id                            AS event_id,
         i.id                                   AS individual_id,
         n.given_names                          AS given_names,
         n.surname                              AS surname
       FROM event_participants ep
       JOIN individuals i
         ON i.id = ep.individual_id
       LEFT JOIN names n
         ON n.individual_id = i.id
         AND n.is_primary = 1
       WHERE ep.event_id IN (${eventIds.map((_, idx) => `$${idx + 1}`).join(', ')})
         AND ep.individual_id IS NOT NULL
       ORDER BY ep.event_id, i.id`,
      eventIds
    );

    participantRows = rawParticipants.map((r) => ({
      citation_id: eventIdToCitationId.get(r.event_id)!,
      individual_id: r.individual_id,
      given_names: r.given_names,
      surname: r.surname,
    }));
  }

  // Step 3: merge and deduplicate individuals per citation
  const individualsByCitation = new Map<number, Map<number, { id: string; name: string }>>();

  for (const row of [...directRows, ...participantRows]) {
    if (!individualsByCitation.has(row.citation_id)) {
      individualsByCitation.set(row.citation_id, new Map());
    }
    const map = individualsByCitation.get(row.citation_id)!;
    if (!map.has(row.individual_id)) {
      const parts = [row.given_names, row.surname].filter(Boolean);
      const name = parts.length > 0 ? parts.join(' ') : 'Unknown';
      map.set(row.individual_id, {
        id: formatEntityId('I', row.individual_id),
        name,
      });
    }
  }

  // Step 4: assemble the final result
  return citationRows.map((row): CitationDetail => {
    const individualsMap = individualsByCitation.get(row.citation_id);
    const linkedIndividuals = individualsMap ? [...individualsMap.values()] : [];

    return {
      citationId: String(row.citation_id),
      page: row.page,
      eventId: row.event_id !== null ? formatEntityId('E', row.event_id) : null,
      eventTypeName: row.event_type_name,
      eventDate: row.event_date,
      linkedIndividuals,
    };
  });
}

import { getTreeDb } from '../connection';
import { formatEntityId, parseEntityId } from '$/lib/entityId';
import type {
  Source,
  SourceCitation,
  SourceCitationWithSource,
  CitationQuality,
  CitableEntityType,
  CreateCitationInput,
  UpdateCitationInput,
  CitationLink,
  CreateCitationLinkInput,
} from '$/types/database';

// =============================================================================
// Raw database row types (snake_case as in SQLite)
// =============================================================================

interface RawSourceCitation {
  id: number;
  source_id: number;
  page: string | null;
  quality: CitationQuality | null;
  date_accessed: string | null;
  text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface RawSourceCitationWithSource extends RawSourceCitation {
  s_id: number;
  s_repository_id: number | null;
  s_title: string;
  s_author: string | null;
  s_publisher: string | null;
  s_publication_date: string | null;
  s_call_number: string | null;
  s_url: string | null;
  s_notes: string | null;
  s_created_at: string;
  s_updated_at: string;
}

interface RawCitationLink {
  id: number;
  citation_id: number;
  entity_type: CitableEntityType;
  entity_id: number;
  field_name: string | null;
  created_at: string;
}

// =============================================================================
// Column lists
// =============================================================================

const CITATION_COLUMNS =
  'id, source_id, page, quality, date_accessed, text, notes, created_at, updated_at';

const CITATION_LINK_COLUMNS =
  'id, citation_id, entity_type, entity_id, field_name, created_at';

// =============================================================================
// Mapping functions
// =============================================================================

function mapToCitation(raw: RawSourceCitation): SourceCitation {
  return {
    id: String(raw.id),
    sourceId: formatEntityId('S', raw.source_id),
    page: raw.page,
    quality: raw.quality,
    dateAccessed: raw.date_accessed,
    text: raw.text,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapToCitationWithSource(raw: RawSourceCitationWithSource): SourceCitationWithSource {
  const source: Source = {
    id: formatEntityId('S', raw.s_id),
    repositoryId: raw.s_repository_id !== null ? formatEntityId('R', raw.s_repository_id) : null,
    title: raw.s_title,
    author: raw.s_author,
    publisher: raw.s_publisher,
    publicationDate: raw.s_publication_date,
    callNumber: raw.s_call_number,
    url: raw.s_url,
    notes: raw.s_notes,
    createdAt: raw.s_created_at,
    updatedAt: raw.s_updated_at,
  };

  return {
    id: String(raw.id),
    sourceId: formatEntityId('S', raw.source_id),
    page: raw.page,
    quality: raw.quality,
    dateAccessed: raw.date_accessed,
    text: raw.text,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    source,
  };
}

function mapToCitationLink(raw: RawCitationLink): CitationLink {
  return {
    id: String(raw.id),
    citationId: String(raw.citation_id),
    entityType: raw.entity_type,
    entityId: formatEntityIdForType(raw.entity_type, raw.entity_id),
    fieldName: raw.field_name,
    createdAt: raw.created_at,
  };
}

// =============================================================================
// Entity ID helpers
// =============================================================================

/**
 * Format a database integer ID to the appropriate entity ID format
 * based on the entity type. Prefixed entities use formatEntityId,
 * non-prefixed entities (name) use String().
 */
function formatEntityIdForType(entityType: CitableEntityType, dbId: number): string {
  switch (entityType) {
    case 'individual':
      return formatEntityId('I', dbId);
    case 'family':
      return formatEntityId('F', dbId);
    case 'event':
      return formatEntityId('E', dbId);
    case 'place':
      return formatEntityId('P', dbId);
    case 'name':
      return String(dbId);
  }
}

/**
 * Parse an entity ID string to a database integer ID based on the entity type.
 * Prefixed entities (individual, event, family, place) use parseEntityId,
 * non-prefixed entities (name) use parseInt.
 */
function parseEntityIdForType(entityType: CitableEntityType, entityId: string): number {
  switch (entityType) {
    case 'individual':
    case 'family':
    case 'event':
    case 'place':
      return parseEntityId(entityId);
    case 'name':
      return parseInt(entityId, 10);
  }
}

// =============================================================================
// SourceCitation CRUD Operations
// =============================================================================

/**
 * Get all citations for a source
 */
export async function getCitationsBySourceId(sourceId: string): Promise<SourceCitation[]> {
  const db = await getTreeDb();
  const dbId = parseEntityId(sourceId);
  const rows = await db.select<RawSourceCitation[]>(
    `SELECT ${CITATION_COLUMNS} FROM source_citations WHERE source_id = $1 ORDER BY id`,
    [dbId]
  );
  return rows.map(mapToCitation);
}

/**
 * Get all citations for a given entity (with source details), joined via citation_links
 */
export async function getCitationsForEntity(
  entityType: CitableEntityType,
  entityId: string
): Promise<SourceCitationWithSource[]> {
  const db = await getTreeDb();
  const dbEntityId = parseEntityIdForType(entityType, entityId);
  const rows = await db.select<RawSourceCitationWithSource[]>(
    `SELECT
       sc.id, sc.source_id, sc.page, sc.quality, sc.date_accessed, sc.text, sc.notes, sc.created_at, sc.updated_at,
       s.id AS s_id, s.repository_id AS s_repository_id, s.title AS s_title,
       s.author AS s_author, s.publisher AS s_publisher, s.publication_date AS s_publication_date,
       s.call_number AS s_call_number, s.url AS s_url, s.notes AS s_notes,
       s.created_at AS s_created_at, s.updated_at AS s_updated_at
     FROM citation_links cl
     JOIN source_citations sc ON sc.id = cl.citation_id
     JOIN sources s ON s.id = sc.source_id
     WHERE cl.entity_type = $1 AND cl.entity_id = $2
     ORDER BY sc.id`,
    [entityType, dbEntityId]
  );
  return rows.map(mapToCitationWithSource);
}

/**
 * Create a new citation
 * @returns The ID of the created citation
 */
export async function createCitation(input: CreateCitationInput): Promise<string> {
  const db = await getTreeDb();
  const sourceDbId = parseEntityId(input.sourceId);
  const result = await db.execute(
    `INSERT INTO source_citations (source_id, page, quality, date_accessed, text, notes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      sourceDbId,
      input.page ?? null,
      input.quality ?? null,
      input.dateAccessed ?? null,
      input.text ?? null,
      input.notes ?? null,
    ]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create citation: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Update a citation
 */
export async function updateCitation(id: string, input: UpdateCitationInput): Promise<void> {
  const db = await getTreeDb();
  const citationId = parseInt(id, 10);

  const sets: string[] = [];
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.sourceId !== undefined) {
    sets.push(`source_id = $${paramIndex++}`);
    params.push(parseEntityId(input.sourceId));
  }
  if (input.page !== undefined) {
    sets.push(`page = $${paramIndex++}`);
    params.push(input.page);
  }
  if (input.quality !== undefined) {
    sets.push(`quality = $${paramIndex++}`);
    params.push(input.quality);
  }
  if (input.dateAccessed !== undefined) {
    sets.push(`date_accessed = $${paramIndex++}`);
    params.push(input.dateAccessed);
  }
  if (input.text !== undefined) {
    sets.push(`text = $${paramIndex++}`);
    params.push(input.text);
  }
  if (input.notes !== undefined) {
    sets.push(`notes = $${paramIndex++}`);
    params.push(input.notes);
  }

  if (sets.length === 0) return;

  sets.push(`updated_at = datetime('now')`);
  params.push(citationId);

  await db.execute(
    `UPDATE source_citations SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
    params
  );
}

/**
 * Delete a citation
 */
export async function deleteCitation(id: string): Promise<void> {
  const db = await getTreeDb();
  await db.execute('DELETE FROM source_citations WHERE id = $1', [parseInt(id, 10)]);
}

// =============================================================================
// CitationLink CRUD Operations
// =============================================================================

/**
 * Create a citation link
 * @returns The ID of the created citation link
 */
export async function createCitationLink(input: CreateCitationLinkInput): Promise<string> {
  const db = await getTreeDb();
  const citationDbId = parseInt(input.citationId, 10);
  const entityDbId = parseEntityIdForType(input.entityType, input.entityId);
  const result = await db.execute(
    `INSERT INTO citation_links (citation_id, entity_type, entity_id, field_name)
     VALUES ($1, $2, $3, $4)`,
    [citationDbId, input.entityType, entityDbId, input.fieldName ?? null]
  );

  if (result.lastInsertId === undefined) {
    throw new Error('Failed to create citation link: no lastInsertId returned');
  }

  return String(result.lastInsertId);
}

/**
 * Remove a citation link by citation ID, entity type, and entity ID
 */
export async function removeCitationLink(
  citationId: string,
  entityType: CitableEntityType,
  entityId: string
): Promise<void> {
  const db = await getTreeDb();
  const citationDbId = parseInt(citationId, 10);
  const entityDbId = parseEntityIdForType(entityType, entityId);
  await db.execute(
    'DELETE FROM citation_links WHERE citation_id = $1 AND entity_type = $2 AND entity_id = $3',
    [citationDbId, entityType, entityDbId]
  );
}

/**
 * Get all citation links for a citation
 */
export async function getCitationLinksForCitation(citationId: string): Promise<CitationLink[]> {
  const db = await getTreeDb();
  const citationDbId = parseInt(citationId, 10);
  const rows = await db.select<RawCitationLink[]>(
    `SELECT ${CITATION_LINK_COLUMNS} FROM citation_links WHERE citation_id = $1 ORDER BY id`,
    [citationDbId]
  );
  return rows.map(mapToCitationLink);
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Get all citations linked to an individual
 */
export async function getCitationsForIndividual(id: string): Promise<SourceCitationWithSource[]> {
  return getCitationsForEntity('individual', id);
}

/**
 * Get all citations linked to a family
 */
export async function getCitationsForFamily(id: string): Promise<SourceCitationWithSource[]> {
  return getCitationsForEntity('family', id);
}

/**
 * Get all citations linked to an event
 */
export async function getCitationsForEvent(id: string): Promise<SourceCitationWithSource[]> {
  return getCitationsForEntity('event', id);
}

/**
 * Get all citations linked to a place
 */
export async function getCitationsForPlace(id: string): Promise<SourceCitationWithSource[]> {
  return getCitationsForEntity('place', id);
}

/**
 * Get all citations linked to a name
 */
export async function getCitationsForName(id: string): Promise<SourceCitationWithSource[]> {
  return getCitationsForEntity('name', id);
}

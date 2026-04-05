import { Link } from '@tanstack/react-router';
import { useCitationsWithDetails } from '$hooks/useCitationsWithDetails';

interface CitationsSummaryProps {
  treeId: string;
  sourceId: string;
}

export function CitationsSummary({ treeId, sourceId }: CitationsSummaryProps): JSX.Element {
  const { data: citations, isLoading } = useCitationsWithDetails(sourceId);

  if (isLoading) {
    return (
      <p style={{ padding: '0.75rem', color: '#888', fontSize: '0.85rem' }}>Loading citations...</p>
    );
  }

  if (!citations || citations.length === 0) {
    return (
      <p style={{ padding: '0.75rem', color: '#888', fontSize: '0.85rem' }}>
        No citations yet — use the panel on the right to start extracting data from this source.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: '0.5rem 0.75rem',
          fontSize: '0.75rem',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        Citations ({citations.length})
      </div>
      {citations.map((citation) => (
        <div
          key={citation.citationId}
          style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f0f0f0' }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {citation.eventTypeName ?? 'No event'}
            {citation.eventDate && (
              <span style={{ fontWeight: 400, color: '#666' }}> — {citation.eventDate}</span>
            )}
          </div>
          {citation.page && (
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.15rem' }}>
              {citation.page}
            </div>
          )}
          {citation.linkedIndividuals.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
              {citation.linkedIndividuals.map((ind) => (
                <Link
                  key={ind.id}
                  to="/tree/$treeId/individual/$individualId"
                  params={{ treeId, individualId: ind.id }}
                  style={{ color: '#06c', textDecoration: 'none', marginRight: '0.5rem' }}
                >
                  {ind.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

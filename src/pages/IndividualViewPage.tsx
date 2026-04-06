import { Link } from '@tanstack/react-router';
import { useIndividual } from '$/hooks/useIndividuals';
import { EventTimeline } from '$components/EventTimeline';
import { formatName } from '$/db/trees/names';
import { GENDER_LABELS } from '$/lib/constants';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

export function IndividualViewPage({ treeId, individualId }: IndividualViewPageProps): JSX.Element {
  const { data: individual, isLoading, isError } = useIndividual(individualId);

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading individual...</p>;
  }

  if (isError || !individual) {
    return (
      <div>
        <Link
          to="/tree/$treeId/individuals"
          params={{ treeId }}
          style={{ color: '#666', textDecoration: 'none' }}
        >
          &larr; Back to Individuals
        </Link>
        <p style={{ color: '#c00', marginTop: '1rem' }}>Individual not found.</p>
      </div>
    );
  }

  const name = formatName(individual.primaryName);

  return (
    <div>
      <Link
        to="/tree/$treeId/individuals"
        params={{ treeId }}
        style={{ color: '#666', textDecoration: 'none' }}
      >
        &larr; Back to Individuals
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>{name.full}</h1>
          <div style={{ color: '#666', marginTop: '0.25rem' }}>
            {GENDER_LABELS[individual.gender] ?? 'Unknown'}
            {' · '}
            {individual.isLiving ? 'Living' : 'Deceased'}
            {' · '}
            {individual.id}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled
            style={{
              padding: '0.5rem 1rem',
              cursor: 'not-allowed',
              background: 'none',
              border: '1px solid #bbb',
              borderRadius: '4px',
              color: '#bbb',
            }}
            title="Coming soon"
          >
            Edit
          </button>
          <button
            disabled
            style={{
              padding: '0.5rem 1rem',
              cursor: 'not-allowed',
              background: 'none',
              border: '1px solid #bbb',
              borderRadius: '4px',
              color: '#bbb',
            }}
            title="Coming soon"
          >
            Delete
          </button>
        </div>
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Names</h2>
        {individual.names.length === 0 ? (
          <p style={{ color: '#666' }}>No names recorded.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {individual.names.map((n) => (
              <li key={n.id}>
                {formatName(n).full}
                {n.isPrimary && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#888',
                      fontStyle: 'italic',
                    }}
                  >
                    (Primary)
                  </span>
                )}
                {n.type !== 'birth' && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
                    [{n.type}]
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Events</h2>
        <EventTimeline treeId={treeId} individualId={individualId} />
      </section>
    </div>
  );
}

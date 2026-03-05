import { Link } from '@tanstack/react-router';
import { useIndividuals } from '$/hooks/useIndividuals';
import { formatName } from '$/db/trees/names';
import { GENDER_LABELS } from '$/lib/constants';

interface IndividualsPageProps {
  treeId: string;
}

export function IndividualsPage({ treeId }: IndividualsPageProps): JSX.Element {
  const { data: individuals, isLoading, isError } = useIndividuals();

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading individuals...</p>;
  }

  if (isError) {
    return <p style={{ color: '#c00' }}>Failed to load individuals.</p>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>Individuals</h1>
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
          New Individual
        </button>
      </div>

      {!individuals || individuals.length === 0 ? (
        <p style={{ color: '#666' }}>No individuals found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {individuals.map((individual) => {
            const name = formatName(individual.primaryName);
            const birthDate = individual.birthEvent?.dateOriginal ?? null;
            const deathDate = individual.deathEvent?.dateOriginal ?? null;

            return (
              <Link
                key={individual.id}
                to="/tree/$treeId/individual/$individualId"
                params={{ treeId, individualId: individual.id }}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{name.full}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {GENDER_LABELS[individual.gender] ?? 'Unknown'}
                  {' · '}
                  {individual.isLiving ? 'Living' : 'Deceased'}
                </div>
                {(birthDate || deathDate) && (
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                    {birthDate && <>b. {birthDate}</>}
                    {birthDate && deathDate && ' — '}
                    {deathDate && <>d. {deathDate}</>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

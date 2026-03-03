import { Link } from '@tanstack/react-router';
import { useFamily } from '$/hooks/useFamilies';
import { formatName } from '$/db/trees/names';
import type { IndividualWithDetails } from '$/types/database';

interface FamilyViewPageProps {
  treeId: string;
  familyId: string;
}

function IndividualLink({
  treeId,
  individual,
  fallback,
}: {
  treeId: string;
  individual: IndividualWithDetails | null;
  fallback: string;
}): JSX.Element {
  if (!individual) {
    return <span style={{ color: '#888' }}>{fallback}</span>;
  }

  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: individual.id }}
      style={{ color: '#333', textDecoration: 'underline' }}
    >
      {formatName(individual.primaryName).full}
    </Link>
  );
}

export function FamilyViewPage({ treeId, familyId }: FamilyViewPageProps): JSX.Element {
  const { data: family, isLoading, isError } = useFamily(familyId);

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading family...</p>;
  }

  if (isError || !family) {
    return (
      <div>
        <Link
          to="/tree/$treeId/families"
          params={{ treeId }}
          style={{ color: '#666', textDecoration: 'none' }}
        >
          &larr; Back to Families
        </Link>
        <p style={{ color: '#c00', marginTop: '1rem' }}>Family not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/tree/$treeId/families"
        params={{ treeId }}
        style={{ color: '#666', textDecoration: 'none' }}
      >
        &larr; Back to Families
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
          <h1 style={{ margin: 0 }}>Family {family.id}</h1>
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
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Husband</h2>
        <IndividualLink treeId={treeId} individual={family.husband} fallback="(No husband)" />
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Wife</h2>
        <IndividualLink treeId={treeId} individual={family.wife} fallback="(No wife)" />
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Children</h2>
        {family.children.length === 0 ? (
          <p style={{ color: '#666', margin: 0 }}>No children recorded.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {family.children.map((child) => (
              <li key={child.id}>
                <Link
                  to="/tree/$treeId/individual/$individualId"
                  params={{ treeId, individualId: child.id }}
                  style={{ color: '#333', textDecoration: 'underline' }}
                >
                  {formatName(child.primaryName).full}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Marriage</h2>
        {!family.marriageEvent ? (
          <p style={{ color: '#666', margin: 0 }}>No marriage event recorded.</p>
        ) : (
          <p style={{ margin: 0 }}>
            {family.marriageEvent.dateOriginal ?? '(no date)'}
            {family.marriageEvent.place && <> — {family.marriageEvent.place.fullName}</>}
          </p>
        )}
      </section>
    </div>
  );
}

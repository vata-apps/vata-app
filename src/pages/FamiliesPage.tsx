import { Link } from '@tanstack/react-router';
import { useFamilies } from '$/hooks/useFamilies';
import { formatName } from '$/db/trees/names';

interface FamiliesPageProps {
  treeId: string;
}

export function FamiliesPage({ treeId }: FamiliesPageProps): JSX.Element {
  const { data: families, isLoading, isError } = useFamilies();

  if (isLoading) {
    return <p style={{ color: '#666' }}>Loading families...</p>;
  }

  if (isError) {
    return <p style={{ color: '#c00' }}>Failed to load families.</p>;
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
        <h1 style={{ margin: 0 }}>Families</h1>
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
          New Family
        </button>
      </div>

      {!families || families.length === 0 ? (
        <p style={{ color: '#666' }}>No families found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {families.map((family) => {
            const husbandName = formatName(family.husband?.primaryName ?? null).full;
            const wifeName = formatName(family.wife?.primaryName ?? null).full;
            const marriageDate = family.marriageEvent?.dateOriginal ?? null;

            return (
              <Link
                key={family.id}
                to="/tree/$treeId/family/$familyId"
                params={{ treeId, familyId: family.id }}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                  {family.id}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {husbandName} &amp; {wifeName}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {family.children.length} {family.children.length === 1 ? 'child' : 'children'}
                  {marriageDate && <> · m. {marriageDate}</>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

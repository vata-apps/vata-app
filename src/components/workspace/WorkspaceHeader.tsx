import { Link } from '@tanstack/react-router';
import type { Source } from '$/types/database';

interface WorkspaceHeaderProps {
  treeId: string;
  sourceId: string;
  source: Source;
}

export function WorkspaceHeader({ treeId, sourceId, source }: WorkspaceHeaderProps): JSX.Element {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '2px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{source.title}</div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
          {sourceId}
          {source.author && <> &middot; {source.author}</>}
        </div>
      </div>
      <Link
        to="/tree/$treeId/source/$sourceId"
        params={{ treeId, sourceId }}
        style={{
          padding: '0.3rem 0.6rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.85rem',
          textDecoration: 'none',
          color: '#333',
        }}
      >
        &larr; Back
      </Link>
    </div>
  );
}

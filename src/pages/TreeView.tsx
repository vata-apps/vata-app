import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getTreeById } from '$/db/system/trees';
import { closeTreeDb } from '$/db/connection';
import { useAppStore } from '$/store/app-store';
import { queryKeys } from '$lib/query-keys';

interface TreeViewPageProps {
  treeId: string;
}

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  const navigate = useNavigate();
  const setCurrentTree = useAppStore((s) => s.setCurrentTree);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: tree, isLoading } = useQuery({
    queryKey: queryKeys.tree(treeId),
    queryFn: () => getTreeById(treeId),
  });

  async function handleClose() {
    await closeTreeDb();
    setCurrentTree(null);
    void navigate({ to: '/' });
  }

  const sidebarWidth = isCollapsed ? 60 : 240;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <nav
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.75rem 0',
          transition: 'width 0.2s, min-width 0.2s',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.75rem',
            marginBottom: '1.5rem',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.25rem',
              flexShrink: 0,
            }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            ☰
          </button>
          {!isCollapsed && (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Vata</strong>
            </Link>
          )}
        </div>

        <Link
          to="/tree/$treeId/individuals"
          params={{ treeId }}
          style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#666',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isCollapsed ? 'I' : 'Individuals'}
        </Link>
        <Link
          to="/tree/$treeId/families"
          params={{ treeId }}
          style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#666',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isCollapsed ? 'F' : 'Families'}
        </Link>

        <Link
          to="/tree/$treeId/data"
          params={{ treeId }}
          style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#666',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title="Debug: View raw data"
        >
          {isCollapsed ? 'D' : 'Data Browser'}
        </Link>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 0.75rem' }}>
          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '0.5rem',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              textAlign: isCollapsed ? 'center' : 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title="Close tree"
          >
            {isCollapsed ? '×' : 'Close Tree'}
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        {isLoading ? (
          <p style={{ color: '#666' }}>Loading...</p>
        ) : !tree ? (
          <p style={{ color: '#c00' }}>Tree not found.</p>
        ) : (
          <>
            <h1 style={{ marginTop: 0 }}>{tree.name}</h1>
            {tree.description && (
              <p style={{ color: '#555', marginBottom: '1.5rem' }}>{tree.description}</p>
            )}
            <div style={{ display: 'flex', gap: '2rem', color: '#888', fontSize: '0.9rem' }}>
              <span>{tree.individualCount} individuals</span>
              <span>{tree.familyCount} families</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

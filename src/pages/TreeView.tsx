import { useQuery } from '@tanstack/react-query';
import { getTreeById } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';

interface TreeViewPageProps {
  treeId: string;
}

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  const { data: tree, isLoading } = useQuery({
    queryKey: queryKeys.tree(treeId),
    queryFn: () => getTreeById(treeId),
  });

  if (isLoading) {
    return <p style={{ padding: '2rem', color: '#666' }}>Loading...</p>;
  }

  if (!tree) {
    return <p style={{ padding: '2rem', color: '#c00' }}>Tree not found.</p>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginTop: 0 }}>{tree.name}</h1>
      {tree.description && (
        <p style={{ color: '#555', marginBottom: '1.5rem' }}>{tree.description}</p>
      )}
      <div style={{ display: 'flex', gap: '2rem', color: '#888', fontSize: '0.9rem' }}>
        <span>{tree.individualCount} individuals</span>
        <span>{tree.familyCount} families</span>
      </div>
    </div>
  );
}

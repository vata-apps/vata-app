import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getAllTrees } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';

export function HomePage() {
  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  if (isLoading) return <p>Loading trees...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div>
      <h1>Vata</h1>
      {!trees || trees.length === 0 ? (
        <p>No trees found.</p>
      ) : (
        <ul>
          {trees.map((tree) => (
            <li key={tree.id}>
              <Link to="/tree/$treeId" params={{ treeId: tree.id }}>
                {tree.name}
              </Link>
              {' — '}
              <span>{tree.path}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

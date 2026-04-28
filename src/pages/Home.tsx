import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getAllTrees } from '$/db/system/trees';
import { queryKeys } from '$lib/query-keys';

export function HomePage() {
  const { t } = useTranslation('common');
  const {
    data: trees,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: getAllTrees,
  });

  if (isLoading) return <p>{t('trees.loading')}</p>;
  if (error) return <p>{t('errors.withMessage', { message: (error as Error).message })}</p>;

  return (
    <div>
      <h1>{t('app.title')}</h1>
      {!trees || trees.length === 0 ? (
        <p>{t('trees.empty')}</p>
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

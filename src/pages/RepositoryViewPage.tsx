import { useTranslation } from 'react-i18next';

interface RepositoryViewPageProps {
  treeId: string;
  repositoryId: string;
}

export function RepositoryViewPage({
  treeId: _treeId,
  repositoryId,
}: RepositoryViewPageProps): JSX.Element {
  const { t } = useTranslation('repositories');
  return <h1>{t('heading', { repositoryId })}</h1>;
}

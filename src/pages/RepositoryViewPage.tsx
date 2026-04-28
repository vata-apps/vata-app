import { useTranslation } from 'react-i18next';

type RepositoryViewPageProps = {
  treeId: string;
  repositoryId: string;
};

export function RepositoryViewPage({ treeId: _treeId, repositoryId }: RepositoryViewPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('repository.heading', { repositoryId })}</h1>;
}

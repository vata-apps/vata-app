import { useTranslation } from 'react-i18next';

type RepositoriesPageProps = {
  treeId: string;
};

export function RepositoriesPage({ treeId: _treeId }: RepositoriesPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('nav.repositories')}</h1>;
}

import { useTranslation } from 'react-i18next';

interface RepositoriesPageProps {
  treeId: string;
}

export function RepositoriesPage({ treeId: _treeId }: RepositoriesPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return <h1>{t('nav.repositories')}</h1>;
}

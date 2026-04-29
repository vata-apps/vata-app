import { useTranslation } from 'react-i18next';

interface FamiliesPageProps {
  treeId: string;
}

export function FamiliesPage({ treeId: _treeId }: FamiliesPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return <h1>{t('nav.families')}</h1>;
}

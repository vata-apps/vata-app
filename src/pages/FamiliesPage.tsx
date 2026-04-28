import { useTranslation } from 'react-i18next';

type FamiliesPageProps = {
  treeId: string;
};

export function FamiliesPage({ treeId: _treeId }: FamiliesPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('nav.families')}</h1>;
}

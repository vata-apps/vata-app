import { useTranslation } from 'react-i18next';

interface FamilyViewPageProps {
  treeId: string;
  familyId: string;
}

export function FamilyViewPage({ treeId: _treeId, familyId }: FamilyViewPageProps): JSX.Element {
  const { t } = useTranslation('families');
  return <h1>{t('heading', { familyId })}</h1>;
}

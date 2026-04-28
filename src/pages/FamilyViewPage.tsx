import { useTranslation } from 'react-i18next';

type FamilyViewPageProps = {
  treeId: string;
  familyId: string;
};

export function FamilyViewPage({ treeId: _treeId, familyId }: FamilyViewPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('family.heading', { familyId })}</h1>;
}

import { useTranslation } from 'react-i18next';

type IndividualViewPageProps = {
  treeId: string;
  individualId: string;
};

export function IndividualViewPage({ treeId: _treeId, individualId }: IndividualViewPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('individual.heading', { individualId })}</h1>;
}

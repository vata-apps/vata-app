import { useTranslation } from 'react-i18next';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

export function IndividualViewPage({
  treeId: _treeId,
  individualId,
}: IndividualViewPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  return <h1>{t('heading', { individualId })}</h1>;
}

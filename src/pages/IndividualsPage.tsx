import { useTranslation } from 'react-i18next';

interface IndividualsPageProps {
  treeId: string;
}

export function IndividualsPage({ treeId: _treeId }: IndividualsPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return <h1>{t('nav.individuals')}</h1>;
}

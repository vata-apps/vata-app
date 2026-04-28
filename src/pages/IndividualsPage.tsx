import { useTranslation } from 'react-i18next';

type IndividualsPageProps = {
  treeId: string;
};

export function IndividualsPage({ treeId: _treeId }: IndividualsPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('nav.individuals')}</h1>;
}

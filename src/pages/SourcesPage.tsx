import { useTranslation } from 'react-i18next';

type SourcesPageProps = {
  treeId: string;
};

export function SourcesPage({ treeId: _treeId }: SourcesPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('nav.sources')}</h1>;
}

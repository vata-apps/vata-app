import { useTranslation } from 'react-i18next';

interface SourcesPageProps {
  treeId: string;
}

export function SourcesPage({ treeId: _treeId }: SourcesPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return <h1>{t('nav.sources')}</h1>;
}

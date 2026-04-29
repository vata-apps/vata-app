import { useTranslation } from 'react-i18next';

interface SourceViewPageProps {
  treeId: string;
  sourceId: string;
}

export function SourceViewPage({ treeId: _treeId, sourceId }: SourceViewPageProps): JSX.Element {
  const { t } = useTranslation('sources');
  return <h1>{t('heading', { sourceId })}</h1>;
}

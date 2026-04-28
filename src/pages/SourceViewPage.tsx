import { useTranslation } from 'react-i18next';

type SourceViewPageProps = {
  treeId: string;
  sourceId: string;
};

export function SourceViewPage({ treeId: _treeId, sourceId }: SourceViewPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('source.heading', { sourceId })}</h1>;
}

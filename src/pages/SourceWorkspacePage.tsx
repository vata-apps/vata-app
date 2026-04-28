import { useTranslation } from 'react-i18next';

type SourceWorkspacePageProps = {
  treeId: string;
  sourceId: string;
};

export function SourceWorkspacePage({ treeId: _treeId, sourceId }: SourceWorkspacePageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('source.workspaceHeading', { sourceId })}</h1>;
}

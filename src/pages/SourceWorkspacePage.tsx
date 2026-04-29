import { useTranslation } from 'react-i18next';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({
  treeId: _treeId,
  sourceId,
}: SourceWorkspacePageProps): JSX.Element {
  const { t } = useTranslation('sources');
  return <h1>{t('workspaceHeading', { sourceId })}</h1>;
}

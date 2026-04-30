import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({ treeId, sourceId }: SourceWorkspacePageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('sources');
  return (
    <div>
      <Button asChild variant="ghost" size="sm">
        <Link to="/tree/$treeId/source/$sourceId" params={{ treeId, sourceId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <h1>{t('workspaceHeading', { sourceId })}</h1>
    </div>
  );
}

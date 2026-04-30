import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';

interface SourceViewPageProps {
  treeId: string;
  sourceId: string;
}

export function SourceViewPage({ treeId, sourceId }: SourceViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('sources');
  return (
    <div>
      <Button asChild variant="ghost" size="sm">
        <Link to="/tree/$treeId/sources" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <h1>{t('heading', { sourceId })}</h1>
    </div>
  );
}

import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';

interface IndividualViewPageProps {
  treeId: string;
  individualId: string;
}

export function IndividualViewPage({ treeId, individualId }: IndividualViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('individuals');
  return (
    <div>
      <Button asChild variant="ghost" size="sm">
        <Link to="/tree/$treeId/individuals" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <h1>{t('heading', { individualId })}</h1>
    </div>
  );
}

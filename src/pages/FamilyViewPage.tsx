import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';

interface FamilyViewPageProps {
  treeId: string;
  familyId: string;
}

export function FamilyViewPage({ treeId, familyId }: FamilyViewPageProps): JSX.Element {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('families');
  return (
    <div>
      <Button asChild variant="ghost" size="sm">
        <Link to="/tree/$treeId/families" params={{ treeId }}>
          {tCommon('nav.back')}
        </Link>
      </Button>
      <h1>{t('heading', { familyId })}</h1>
    </div>
  );
}

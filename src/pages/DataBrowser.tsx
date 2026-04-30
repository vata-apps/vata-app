import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '$components/ui/button';

interface DataBrowserPageProps {
  treeId: string;
}

export function DataBrowserPage({ treeId }: DataBrowserPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div>
      <Button asChild variant="ghost" size="sm">
        <Link to="/tree/$treeId" params={{ treeId }}>
          {t('nav.back')}
        </Link>
      </Button>
      <h1>{t('nav.dataBrowser')}</h1>
    </div>
  );
}

import { useTranslation } from 'react-i18next';

interface DataBrowserPageProps {
  treeId: string;
}

export function DataBrowserPage({ treeId: _treeId }: DataBrowserPageProps): JSX.Element {
  const { t } = useTranslation('common');
  return <h1>{t('nav.dataBrowser')}</h1>;
}

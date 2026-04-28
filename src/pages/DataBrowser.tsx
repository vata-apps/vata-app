import { useTranslation } from 'react-i18next';

type DataBrowserPageProps = {
  treeId: string;
};

export function DataBrowserPage({ treeId: _treeId }: DataBrowserPageProps) {
  const { t } = useTranslation('common');
  return <h1>{t('nav.dataBrowser')}</h1>;
}

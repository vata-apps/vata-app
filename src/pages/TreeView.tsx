import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

type TreeViewPageProps = {
  treeId: string;
};

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('tree.heading', { treeId })}</h1>
      <nav>
        <ul>
          <li>
            <Link to="/tree/$treeId/individuals" params={{ treeId }}>
              {t('nav.individuals')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/families" params={{ treeId }}>
              {t('nav.families')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/sources" params={{ treeId }}>
              {t('nav.sources')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/repositories" params={{ treeId }}>
              {t('nav.repositories')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/data" params={{ treeId }}>
              {t('nav.dataBrowser')}
            </Link>
          </li>
          <li>
            <Link to="/">{t('nav.backToHome')}</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

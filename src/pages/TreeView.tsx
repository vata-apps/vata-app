import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface TreeViewPageProps {
  treeId: string;
}

export function TreeViewPage({ treeId }: TreeViewPageProps): JSX.Element {
  const { t } = useTranslation(['common', 'trees']);
  return (
    <div>
      <h1>{t('trees:heading', { treeId })}</h1>
      <nav>
        <ul>
          <li>
            <Link to="/tree/$treeId/individuals" params={{ treeId }}>
              {t('common:nav.individuals')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/families" params={{ treeId }}>
              {t('common:nav.families')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/sources" params={{ treeId }}>
              {t('common:nav.sources')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/repositories" params={{ treeId }}>
              {t('common:nav.repositories')}
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/data" params={{ treeId }}>
              {t('common:nav.dataBrowser')}
            </Link>
          </li>
          <li>
            <Link to="/">{t('common:nav.backToHome')}</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

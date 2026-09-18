import { useTranslation } from 'react-i18next';
import { NAV_SECTIONS, NavSection } from '$lib/nav-sections';
import * as styles from './tree-nav.css';
import { TreeNavItem } from './tree-nav-item';

export function TreeNav(): JSX.Element | null {
  const { t } = useTranslation('common');

  const settingsSection: NavSection = {
    icon: 'settings',
    id: 'settings',
    labelKey: 'nav.settings',
    to: '/settings',
  };

  return (
    <nav aria-label={t('nav.ariaLabel')} className={styles.nav}>
      {NAV_SECTIONS.map((section) => (
        <TreeNavItem key={section.id} section={section} />
      ))}

      <div style={{ marginTop: 'auto' }}>
        <TreeNavItem section={settingsSection} />
      </div>
    </nav>
  );
}

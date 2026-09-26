import { shellContainer } from '$/styles/shared/shellContainer.stylex';
import { NAV_SECTIONS, NavSection } from '$lib/nav-sections';
import { props } from '@stylexjs/stylex';
import { useTranslation } from 'react-i18next';
import { TreeNavItem } from './tree-nav-item';
import { styles } from './tree-nav.styles';

export function TreeNav(): JSX.Element | null {
  const { t } = useTranslation('common');

  const settingsSection: NavSection = {
    icon: 'settings',
    id: 'settings',
    labelKey: 'nav.settings',
    to: '/settings',
  };

  return (
    <nav
      aria-label={t('nav.ariaLabel')}
      {...props(shellContainer.base, shellContainer.borderInlineEnd, styles.root)}
    >
      {NAV_SECTIONS.map((section) => (
        <TreeNavItem key={section.id} section={section} />
      ))}

      <div style={{ marginTop: 'auto' }}>
        <TreeNavItem section={settingsSection} />
      </div>
    </nav>
  );
}

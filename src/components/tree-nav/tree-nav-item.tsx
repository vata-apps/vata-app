import { getTreeIdFromPath, NavSection, resolveNavSection } from '$/lib/nav-sections';
import { Tooltip } from '$components/ui/tooltip';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import * as styles from './tree-nav-item.css';

interface TreeNavItemProps {
  section: NavSection;
}

export function TreeNavItem({ section }: TreeNavItemProps) {
  const { t } = useTranslation('common');

  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeSection = resolveNavSection(pathname);

  const treeId = getTreeIdFromPath(pathname);
  if (treeId === null) return null;

  const isActive = section.id === activeSection;
  const label = t(section.labelKey);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Link
            to={section.to}
            params={{ treeId }}
            className={styles.item({ isActive })}
            activeOptions={{ exact: true }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            preload="render"
          >
            {t(section.labelKey)[0]}
          </Link>
        }
      />

      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={6}>
          <Tooltip.Popup>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

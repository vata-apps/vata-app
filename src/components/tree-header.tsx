import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { Button } from '$components/ui/button';
import { DataChip } from '$components/ui/data-chip';
import * as styles from './tree-header.css';

/**
 * The persistent header of the in-tree shell — shown above every page under
 * `/tree/$treeId/...`, next to {@link TreeNav}.
 *
 * Two controls, both disabled for now: a global search trigger (`⌘K`) and a
 * `Create` quick-create button. Neither is wired to behavior yet — this slice
 * only builds the app-shell chrome; see the parent PRD for the follow-up
 * issues that bring them to life.
 */
export function TreeHeader(): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <header className={styles.header}>
      <button type="button" disabled className={styles.search}>
        <Icon name="search" size={15} />
        <span className={styles.searchLabel}>{t('header.search')}</span>
        <DataChip>{t('header.searchShortcut')}</DataChip>
      </button>

      <div className={styles.spacer} />

      <Button disabled>
        <Icon name="plus" />
        {t('header.create')}
      </Button>
    </header>
  );
}

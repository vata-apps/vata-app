import * as styles from './tree-header.css';
import { Breadcrumb } from '../ui/breadcrumb/breadcrumb';
import { useMatches } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

function useButton(key: 'create' | 'edit') {
  return useMatches()
    .filter((match) => match.loaderData?.[key])
    .map((match) => match.loaderData?.[key])[0];
}

export function TreeHeader(): JSX.Element {
  const { t } = useTranslation('individuals');

  const createButton = useButton('create');
  const editButton = useButton('edit');

  return (
    <header className={styles.root}>
      <Breadcrumb />

      <div className={styles.actions}>
        {editButton && (
          <Button
            onClick={() => {
              // TODO: Handle edit click
            }}
          >
            {t(editButton.labelKey)}
          </Button>
        )}

        {createButton && (
          <Button
            onClick={() => {
              // TODO: Handle create click
            }}
            variant="primary"
          >
            {t(createButton.labelKey)}
          </Button>
        )}
      </div>
    </header>
  );
}

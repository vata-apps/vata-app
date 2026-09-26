import { shellContainer } from '$/styles/shared/shellContainer.stylex';
import { props } from '@stylexjs/stylex';
import { useMatches } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '../ui/breadcrumb/breadcrumb';
import { Button } from '../ui/button/button';
import { styles } from './tree-header.styles';

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
    <header {...props(shellContainer.base, shellContainer.borderBlockEnd, styles.root)}>
      <Breadcrumb />

      <div {...props(styles.actions)}>
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

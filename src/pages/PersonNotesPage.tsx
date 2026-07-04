import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';

/** The Notes tab of a person — not implemented yet. */
export function PersonNotesPage(): JSX.Element {
  const { t } = useTranslation('individuals');

  return <CenteredMessage>{t('notes.comingSoon')}</CenteredMessage>;
}

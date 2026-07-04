import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';

/** The Sources tab of a person — not implemented yet. */
export function PersonSourcesPage(): JSX.Element {
  const { t } = useTranslation('individuals');

  return <CenteredMessage>{t('sources.comingSoon')}</CenteredMessage>;
}

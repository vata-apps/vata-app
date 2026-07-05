import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { AncestorsChart } from '$components/person-ancestors/ancestors-chart';
import { useAncestors } from '$hooks/useAncestors';

interface PersonAncestorsPageProps {
  treeId: string;
  individualId: string;
}

/**
 * The Pedigree / Ascendance tab: a fixed 4-generation ancestors chart along a
 * single lineage (the first parent Family at each step, matching the
 * Overview's own Parents section).
 */
export function PersonAncestorsPage({
  treeId,
  individualId,
}: PersonAncestorsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useAncestors(individualId);

  if (isLoading) {
    return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  }
  if (isError || !data) {
    return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;
  }

  return <AncestorsChart layout={data} treeId={treeId} />;
}

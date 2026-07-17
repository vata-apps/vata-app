import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { PersonEditorDialog } from '$components/individuals/person-editor-dialog';
import { IdentityHeader, OverviewTabs } from '$components/person-overview/identity-header';
import { usePersonOverview } from '$hooks/usePersonOverview';
import * as styles from './individual-layout.css';

interface IndividualLayoutProps {
  treeId: string;
  individualId: string;
}

/**
 * The shell shared by every tab of one individual: the identity header and the
 * section tab bar, with the active tab rendered through `<Outlet/>`. Identity
 * data comes from {@link usePersonOverview}; the same cached query backs the
 * Overview tab, so switching tabs never refetches the header.
 */
export function IndividualLayout({ treeId, individualId }: IndividualLayoutProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePersonOverview(individualId);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  }

  // A query failure must not masquerade as "not found" — surface a load error.
  if (isError) {
    return <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;
  }

  if (!data) {
    return <CenteredMessage>{t('overview.notFound')}</CenteredMessage>;
  }

  return (
    <div className={styles.page}>
      <IdentityHeader person={data.person} onEdit={() => setEditOpen(true)} />
      <div className={styles.body}>
        <OverviewTabs treeId={treeId} individualId={individualId} />
        <Outlet />
      </div>

      <PersonEditorDialog
        mode="edit"
        individualId={individualId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}

import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '$components/centered-message';
import { PersonEditorDialog } from '$components/individuals/person-editor-dialog';
import { PersonRail } from '$components/person-rail/person-rail';
import { IdentityHeader, OverviewTabs } from '$components/person-overview/identity-header';
import { usePersonOverview } from '$hooks/usePersonOverview';
import * as styles from './individual-layout.css';

interface IndividualLayoutProps {
  treeId: string;
  individualId: string;
}

/**
 * The shell shared by every tab of one individual: the persistent people
 * rail ({@link PersonRail}) beside the identity header and section tab bar,
 * with the active tab rendered through `<Outlet/>`. The rail stays mounted
 * even while this person's own data is loading or failed to load, so
 * switching to another person is always available. Identity data comes from
 * {@link usePersonOverview}; the same cached query backs the Overview tab, so
 * switching tabs never refetches the header.
 */
export function IndividualLayout({ treeId, individualId }: IndividualLayoutProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePersonOverview(individualId);
  const [editOpen, setEditOpen] = useState(false);

  let mainContent: JSX.Element;
  if (isLoading) {
    mainContent = <CenteredMessage>{t('overview.loading')}</CenteredMessage>;
  } else if (isError) {
    // A query failure must not masquerade as "not found" — surface a load error.
    mainContent = <CenteredMessage>{tCommon('errors.loadFailed')}</CenteredMessage>;
  } else if (!data) {
    mainContent = <CenteredMessage>{t('overview.notFound')}</CenteredMessage>;
  } else {
    mainContent = (
      <>
        <div className={styles.content}>
          <IdentityHeader person={data.person} onEdit={() => setEditOpen(true)} />
          <OverviewTabs treeId={treeId} individualId={individualId} />
        </div>
        <div className={styles.outlet}>
          <Outlet />
        </div>
      </>
    );
  }

  return (
    <div className={styles.shell}>
      <PersonRail treeId={treeId} activeIndividualId={individualId} />

      <div className={styles.main}>{mainContent}</div>

      <PersonEditorDialog
        mode="edit"
        individualId={individualId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}

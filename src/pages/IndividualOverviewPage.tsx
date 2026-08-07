import { LifeSpine } from '$components/person-overview/life-spine';
import { PlacesPanel } from '$components/person-overview/places-panel';
import { RecordRail } from '$components/person-overview/record-rail';
import { usePersonOverview } from '$hooks/usePersonOverview';
import * as styles from './individual-overview.css';

interface IndividualOverviewPageProps {
  treeId: string;
  individualId: string;
}

/**
 * The Overview tab body: a parents/names/media rail beside the person's
 * milestone events and places, all driven by live tree data via
 * {@link usePersonOverview}. The identity header and tabs live in the layout,
 * and carry the vitals summary — this body never repeats it.
 */
export function IndividualOverviewPage({
  treeId,
  individualId,
}: IndividualOverviewPageProps): JSX.Element | null {
  const { data } = usePersonOverview(individualId);

  // The layout gates on loading / not-found before rendering this Outlet, and
  // both read the same cached query — so `data` is present here; this guard is
  // only for type narrowing.
  if (!data) return null;

  return (
    <div className={styles.grid}>
      <RecordRail
        parents={data.parents}
        names={data.names}
        individualId={individualId}
        treeId={treeId}
      />
      <div className={styles.column}>
        <LifeSpine milestones={data.milestones} individualId={individualId} treeId={treeId} />
        <PlacesPanel places={data.placesLived} treeId={treeId} />
      </div>
    </div>
  );
}

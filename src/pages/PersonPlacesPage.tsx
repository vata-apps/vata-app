import { useParams } from '@tanstack/react-router';

import { PlacesPanel } from '$components/person-overview/places-panel';
import { usePersonOverview } from '$hooks/usePersonOverview';

/**
 * The Places tab: every distinct place tied to this person's own events and
 * marriages, reusing the Overview summary's map + row list in full. Backed by
 * the same {@link usePersonOverview} query as the layout and the Overview
 * tab, so switching here never refetches — `data` is always present by the
 * time this renders (the layout gates on loading / not-found first).
 */
export function PersonPlacesPage(): JSX.Element | null {
  const { treeId, individualId } = useParams({
    from: '/tree/$treeId/individual/$individualId/places',
  });
  const { data } = usePersonOverview(individualId);

  if (!data) return null;

  return <PlacesPanel places={data.placesLived} treeId={treeId} />;
}

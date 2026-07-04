import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

vi.mock('$components/map/places-map', () => ({ PlacesMap: vi.fn(() => null) }));
vi.mock('./entity-links', () => ({
  PlaceLink: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import { PlacesMap } from '$components/map/places-map';
import { PlacesPanel } from './places-panel';
import type { OverviewPlaceLived } from './overview-types';

function makePlace(overrides: Partial<OverviewPlaceLived> = {}): OverviewPlaceLived {
  return {
    id: 'P-0001',
    name: 'Longueuil',
    contexts: [],
    latitude: null,
    longitude: null,
    ...overrides,
  };
}

describe('PlacesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the map with only the geocoded places', () => {
    const geocoded = makePlace({
      id: 'P-0001',
      name: 'Longueuil',
      latitude: 45.53,
      longitude: -73.5,
    });
    const ungeocoded = makePlace({ id: 'P-0002', name: 'Somewhere unknown' });

    render(<PlacesPanel places={[geocoded, ungeocoded]} treeId="1" />);

    expect(PlacesMap).toHaveBeenCalledTimes(1);
    const [props] = vi.mocked(PlacesMap).mock.calls[0];
    expect(props).toEqual({
      points: [{ id: 'P-0001', name: 'Longueuil', latitude: 45.53, longitude: -73.5 }],
      highlightedId: null,
    });
  });

  it('omits the map when no places are geocoded', () => {
    render(<PlacesPanel places={[makePlace()]} treeId="1" />);
    expect(PlacesMap).not.toHaveBeenCalled();
  });

  it('omits the map when there are no places', () => {
    render(<PlacesPanel places={[]} treeId="1" />);
    expect(PlacesMap).not.toHaveBeenCalled();
  });

  it('highlights the hovered place on the map, clearing it on mouse leave', async () => {
    const user = userEvent.setup();
    const geocoded = makePlace({
      id: 'P-0001',
      name: 'Longueuil',
      latitude: 45.53,
      longitude: -73.5,
    });
    render(<PlacesPanel places={[geocoded]} treeId="1" />);

    await user.hover(screen.getByText('Longueuil'));
    expect(vi.mocked(PlacesMap).mock.calls.at(-1)?.[0]).toMatchObject({ highlightedId: 'P-0001' });

    await user.unhover(screen.getByText('Longueuil'));
    expect(vi.mocked(PlacesMap).mock.calls.at(-1)?.[0]).toMatchObject({ highlightedId: null });
  });
});

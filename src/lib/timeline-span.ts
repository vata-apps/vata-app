export const SPAN_BUFFER = 5;
const ESTIMATED_SPAN = 60;
const MARRIAGE_SPAN = 20;

export type TimelineMarkerType =
  | 'birth'
  | 'marriage'
  | 'death'
  | 'today'
  | 'estimated-start'
  | 'estimated-end';

export interface TimelineMarker {
  type: TimelineMarkerType;
  year: number;
}

export interface TimelineInput {
  birthYear: number | null;
  marriageYears: number[];
  deathYear: number | null;
  isLiving: boolean;
  todayYear: number;
}

export type TimelineModel =
  | { kind: 'no-timeline' }
  | { kind: 'birth-only'; birthYear: number }
  | {
      kind: 'span';
      start: number;
      end: number;
      markers: TimelineMarker[];
    };

/**
 * Compute the timeline model from a person's life events.
 *
 * Rules (all years derived from dateSort YYYY-MM-DD):
 * - Span buffer: ±5 years around the anchors.
 * - Living (no death): end anchor = todayYear.
 * - Deceased, no death: estimate end = latest_marriage + 20, fallback birth + 60.
 * - No birth, death known: estimate start = earliest_marriage - 20, fallback death - 60.
 * - Birth only (no marriages, no death, not living): minimal birth-only model.
 * - No dated events at all: returns { kind: 'no-timeline' }.
 */
export function computeTimelineSpan(input: TimelineInput): TimelineModel {
  const { birthYear, marriageYears, deathYear, isLiving, todayYear } = input;
  const sortedMarriages = [...marriageYears].sort((a, b) => a - b);

  const hasAnyData = birthYear !== null || deathYear !== null || sortedMarriages.length > 0;
  if (!hasAnyData) return { kind: 'no-timeline' };

  // Birth-only: birth is the sole data point and the person is not living
  if (birthYear !== null && sortedMarriages.length === 0 && deathYear === null && !isLiving) {
    return { kind: 'birth-only', birthYear };
  }

  const markers: TimelineMarker[] = [];

  // ---- start anchor ----
  let startAnchor: number;
  if (birthYear !== null) {
    startAnchor = birthYear;
    markers.push({ type: 'birth', year: birthYear });
  } else if (sortedMarriages.length > 0) {
    startAnchor = sortedMarriages[0] - MARRIAGE_SPAN;
    markers.push({ type: 'estimated-start', year: startAnchor });
  } else {
    // Only death available (hasAnyData guarantees deathYear !== null here)
    startAnchor = deathYear! - ESTIMATED_SPAN;
    markers.push({ type: 'estimated-start', year: startAnchor });
  }

  // ---- marriage markers ----
  for (const year of sortedMarriages) {
    markers.push({ type: 'marriage', year });
  }

  // ---- end anchor ----
  let endAnchor: number;
  if (deathYear !== null) {
    endAnchor = deathYear;
    markers.push({ type: 'death', year: deathYear });
  } else if (isLiving) {
    endAnchor = todayYear;
    markers.push({ type: 'today', year: todayYear });
  } else if (sortedMarriages.length > 0) {
    endAnchor = sortedMarriages[sortedMarriages.length - 1] + MARRIAGE_SPAN;
    markers.push({ type: 'estimated-end', year: endAnchor });
  } else {
    // Only birth — person is living or has marriages, so birth-only was skipped.
    // Safety fallback (unreachable in practice).
    endAnchor = birthYear! + ESTIMATED_SPAN;
    markers.push({ type: 'estimated-end', year: endAnchor });
  }

  return {
    kind: 'span',
    start: startAnchor - SPAN_BUFFER,
    end: endAnchor + SPAN_BUFFER,
    markers,
  };
}

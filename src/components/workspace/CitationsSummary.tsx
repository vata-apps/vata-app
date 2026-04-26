import { Link } from '@tanstack/react-router';
import { useCitationsWithDetails } from '$hooks/useCitationsWithDetails';

interface CitationsSummaryProps {
  treeId: string;
  sourceId: string;
}

export function CitationsSummary({ treeId, sourceId }: CitationsSummaryProps): JSX.Element {
  const { data: citations, isLoading, isError } = useCitationsWithDetails(sourceId);

  if (isLoading) {
    return <p className="p-3 text-sm text-muted-foreground">Loading citations...</p>;
  }

  if (isError) {
    return <p className="p-3 text-sm text-destructive">Failed to load citations.</p>;
  }

  if (!citations || citations.length === 0) {
    return (
      <p className="p-3 text-sm text-muted-foreground">
        No citations yet — use the panel on the right to start extracting data from this source.
      </p>
    );
  }

  return (
    <div>
      <div className="border-b border-border px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
        Citations ({citations.length})
      </div>
      {citations.map((citation) => (
        <div key={citation.citationId} className="border-b border-border px-3 py-2.5">
          <div className="text-sm font-semibold">
            {citation.eventTypeName ?? 'No event'}
            {citation.eventDate && (
              <span className="font-normal text-muted-foreground"> — {citation.eventDate}</span>
            )}
          </div>
          {citation.page && (
            <div className="mt-0.5 text-xs text-muted-foreground">{citation.page}</div>
          )}
          {citation.linkedIndividuals.length > 0 && (
            <div className="mt-1 text-sm text-foreground/70">
              {citation.linkedIndividuals.map((ind) => (
                <Link
                  key={ind.id}
                  to="/tree/$treeId/individual/$individualId"
                  params={{ treeId, individualId: ind.id }}
                  className="mr-2 text-primary no-underline"
                >
                  {ind.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

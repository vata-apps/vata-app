import { Link } from '@tanstack/react-router';
import type { Source } from '$/types/database';

interface WorkspaceHeaderProps {
  treeId: string;
  sourceId: string;
  source: Source;
}

export function WorkspaceHeader({ treeId, sourceId, source }: WorkspaceHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
      <div>
        <div className="text-base font-bold">{source.title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {sourceId}
          {source.author && <> &middot; {source.author}</>}
        </div>
      </div>
      <Link
        to="/tree/$treeId/source/$sourceId"
        params={{ treeId, sourceId }}
        className="rounded border border-border px-2.5 py-1 text-sm text-foreground no-underline"
      >
        &larr; Back
      </Link>
    </div>
  );
}

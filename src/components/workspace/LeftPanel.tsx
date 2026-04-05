import { CitationsSummary } from './CitationsSummary';

interface LeftPanelProps {
  treeId: string;
  sourceId: string;
}

export function LeftPanel({ treeId, sourceId }: LeftPanelProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CitationsSummary treeId={treeId} sourceId={sourceId} />
    </div>
  );
}

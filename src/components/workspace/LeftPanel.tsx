import { CitationsSummary } from './CitationsSummary';
import { ImageViewer } from './ImageViewer';

interface LeftPanelProps {
  treeId: string;
  sourceId: string;
}

export function LeftPanel({ treeId, sourceId }: LeftPanelProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CitationsSummary treeId={treeId} sourceId={sourceId} />
      <ImageViewer sourceId={sourceId} />
    </div>
  );
}

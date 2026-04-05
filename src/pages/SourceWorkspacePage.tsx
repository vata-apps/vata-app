import { useSource } from '$/hooks/useSources';
import { WorkspaceHeader } from '$/components/workspace/WorkspaceHeader';
import { WorkspaceLayout } from '$/components/workspace/WorkspaceLayout';
import { LeftPanel } from '$/components/workspace/LeftPanel';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({ treeId, sourceId }: SourceWorkspacePageProps): JSX.Element {
  const { data: source, isLoading, isError } = useSource(sourceId);

  if (isLoading) {
    return <p style={{ padding: '1rem', color: '#666' }}>Loading...</p>;
  }

  if (isError || !source) {
    return <p style={{ padding: '1rem', color: '#c00' }}>Source not found.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WorkspaceHeader treeId={treeId} sourceId={sourceId} source={source} />
      <WorkspaceLayout
        left={<LeftPanel treeId={treeId} sourceId={sourceId} />}
        right={<div style={{ padding: '1rem', color: '#888' }}>Right panel (templates)</div>}
      />
    </div>
  );
}

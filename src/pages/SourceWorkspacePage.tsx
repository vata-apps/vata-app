import { useSource } from '$/hooks/useSources';
import { WorkspaceHeader } from '$/components/workspace/WorkspaceHeader';
import { WorkspaceLayout } from '$/components/workspace/WorkspaceLayout';
import { LeftPanel } from '$/components/workspace/LeftPanel';
import { RightPanel } from '$/components/workspace/RightPanel';

interface SourceWorkspacePageProps {
  treeId: string;
  sourceId: string;
}

export function SourceWorkspacePage({ treeId, sourceId }: SourceWorkspacePageProps): JSX.Element {
  const { data: source, isLoading, isError } = useSource(sourceId);

  if (isLoading) {
    return <p style={{ padding: '1rem', color: '#666' }}>Loading...</p>;
  }

  if (isError) {
    return <p style={{ padding: '1rem', color: '#c00' }}>Failed to load source.</p>;
  }

  if (!source) {
    return <p style={{ padding: '1rem', color: '#c00' }}>Source not found.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WorkspaceHeader treeId={treeId} sourceId={sourceId} source={source} />
      <WorkspaceLayout
        left={<LeftPanel treeId={treeId} sourceId={sourceId} />}
        right={<RightPanel sourceId={sourceId} />}
      />
    </div>
  );
}

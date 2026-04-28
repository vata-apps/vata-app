type SourceWorkspacePageProps = {
  treeId: string;
  sourceId: string;
};

export function SourceWorkspacePage({ treeId: _treeId, sourceId }: SourceWorkspacePageProps) {
  return <h1>Source workspace {sourceId}</h1>;
}

type SourceViewPageProps = {
  treeId: string;
  sourceId: string;
};

export function SourceViewPage({ treeId: _treeId, sourceId }: SourceViewPageProps) {
  return <h1>Source {sourceId}</h1>;
}

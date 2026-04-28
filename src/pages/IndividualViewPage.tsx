type IndividualViewPageProps = {
  treeId: string;
  individualId: string;
};

export function IndividualViewPage({ treeId: _treeId, individualId }: IndividualViewPageProps) {
  return <h1>Individual {individualId}</h1>;
}

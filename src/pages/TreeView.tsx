interface TreeDashboardProps {
  treeId: string;
}

export function TreeDashboard({ treeId }: TreeDashboardProps): JSX.Element {
  return <div>Dashbaord for tree: {treeId}</div>;
}

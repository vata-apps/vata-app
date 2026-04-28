type TreeViewPageProps = {
  treeId: string;
};

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  return <h1>Tree {treeId}</h1>;
}

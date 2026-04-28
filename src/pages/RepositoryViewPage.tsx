type RepositoryViewPageProps = {
  treeId: string;
  repositoryId: string;
};

export function RepositoryViewPage({ treeId: _treeId, repositoryId }: RepositoryViewPageProps) {
  return <h1>Repository {repositoryId}</h1>;
}

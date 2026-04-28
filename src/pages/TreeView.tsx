import { Link } from '@tanstack/react-router';

type TreeViewPageProps = {
  treeId: string;
};

export function TreeViewPage({ treeId }: TreeViewPageProps) {
  return (
    <div>
      <h1>Tree {treeId}</h1>
      <nav>
        <ul>
          <li>
            <Link to="/tree/$treeId/individuals" params={{ treeId }}>
              Individuals
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/families" params={{ treeId }}>
              Families
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/sources" params={{ treeId }}>
              Sources
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/repositories" params={{ treeId }}>
              Repositories
            </Link>
          </li>
          <li>
            <Link to="/tree/$treeId/data" params={{ treeId }}>
              Data Browser
            </Link>
          </li>
          <li>
            <Link to="/">Back to Home</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

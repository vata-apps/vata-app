import { Link } from "@tanstack/react-router";

export function TreesPage() {
  return (
    <div>
      <h1>Trees</h1>
      <ul>
        <li>
          <Link to="/$treeId" params={{ treeId: "demo" }}>
            Demo Tree
          </Link>
        </li>
        <li>
          <Link to="/$treeId" params={{ treeId: "research" }}>
            Research Tree
          </Link>
        </li>
      </ul>
    </div>
  );
}

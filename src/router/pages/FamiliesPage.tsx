import { Link, useParams } from "@tanstack/react-router";

export function FamiliesPage() {
  const { treeId } = useParams({ from: "/$treeId/families" });

  return (
    <div>
      <h1>Families</h1>
      <p>Tree ID: {treeId}</p>
      <Link to="/$treeId/families/$familyId" params={{ treeId, familyId: "1" }}>
        Family 1
      </Link>
    </div>
  );
}

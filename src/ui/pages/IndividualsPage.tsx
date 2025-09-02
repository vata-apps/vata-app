import { Link, useParams } from "@tanstack/react-router";

export function IndividualsPage() {
  const { treeId } = useParams({ from: "/$treeId/individuals" });

  return (
    <div>
      <h1>Individuals</h1>
      <p>Tree ID: {treeId}</p>
      <Link
        to="/$treeId/individuals/$individualId"
        params={{ treeId, individualId: "1" }}
      >
        Individual 1
      </Link>
    </div>
  );
}

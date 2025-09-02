import { useParams } from "@tanstack/react-router";

export function IndividualPage() {
  const { individualId, treeId } = useParams({
    from: "/$treeId/individuals/$individualId",
  });

  return (
    <div>
      <h1>Individual</h1>
      <p>Tree ID: {treeId}</p>
      <p>Individual ID: {individualId}</p>
    </div>
  );
}

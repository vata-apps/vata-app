import { useParams } from "@tanstack/react-router";

export function FamilyPage() {
  const { familyId, treeId } = useParams({
    from: "/$treeId/families/$familyId",
  });

  return (
    <div>
      <h1>Family</h1>
      <p>Tree ID: {treeId}</p>
      <p>Family ID: {familyId}</p>
    </div>
  );
}

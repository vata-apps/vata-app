import { useParams } from "@tanstack/react-router";

export function FamilyPage() {
  const { familyId } = useParams({ from: "/families/$familyId" });

  return (
    <div>
      <h1>Family</h1>
      <p>Family ID: {familyId}</p>
    </div>
  );
}

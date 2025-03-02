import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/$familyId")({
  component: FamilyPage,
});

function FamilyPage() {
  const { familyId } = Route.useParams();
  return <div>Family Page - ID: {familyId}</div>;
}

export default FamilyPage;

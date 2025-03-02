import { H2 } from "@/components/typography/h2";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/$familyId")({
  component: FamilyPage,
});

function FamilyPage() {
  const { familyId } = Route.useParams();
  return <H2>Family Page - ID: {familyId}</H2>;
}

export default FamilyPage;

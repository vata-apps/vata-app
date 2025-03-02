import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  return <div>Families Page</div>;
}

export default FamiliesPage;

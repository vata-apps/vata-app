import { H2 } from "@/components/typography/h2";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/families/")({
  component: FamiliesPage,
});

function FamiliesPage() {
  return <H2>Families Page</H2>;
}

export default FamiliesPage;

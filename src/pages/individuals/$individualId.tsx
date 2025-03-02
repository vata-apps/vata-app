import { H2 } from "@/components/typography/h2";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualPage,
});

function IndividualPage() {
  const { individualId } = Route.useParams();
  return <H2>Individual Page - ID: {individualId}</H2>;
}

export default IndividualPage;

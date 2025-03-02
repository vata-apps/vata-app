import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/$individualId")({
  component: IndividualPage,
});

function IndividualPage() {
  const { individualId } = Route.useParams();
  return <div>Individual Page - ID: {individualId}</div>;
}

export default IndividualPage;

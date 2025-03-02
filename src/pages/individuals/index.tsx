import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals/")({
  component: IndividualsPage,
});

function IndividualsPage() {
  return <div>Individuals Page</div>;
}

export default IndividualsPage;

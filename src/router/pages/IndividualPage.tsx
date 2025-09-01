import { useParams } from "@tanstack/react-router";

export function IndividualPage() {
  const { individualId } = useParams({ from: "/individuals/$individualId" });

  return (
    <div>
      <h1>Individual</h1>
      <p>Individual ID: {individualId}</p>
    </div>
  );
}

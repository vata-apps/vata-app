import { PageHeader } from "@/components/PageHeader";
import { useParams } from "@tanstack/react-router";

export function HomePage() {
  const { treeId } = useParams({ from: "/$treeId" });

  return (
    <>
      <PageHeader title="Home" />
      <p>Tree ID: {treeId}</p>
    </>
  );
}

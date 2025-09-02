import { useParams } from "@tanstack/react-router";

export function HomePage() {
  const { treeId } = useParams({ from: "/$treeId" });

  return (
    <div>
      <h1>Home Page</h1>
      <p>Tree ID: {treeId}</p>
    </div>
  );
}

import { Link, useParams } from "@tanstack/react-router";

export function PlacesPage() {
  const { treeId } = useParams({ from: "/$treeId/places" });

  return (
    <div>
      <h1>Places</h1>
      <p>Tree ID: {treeId}</p>
      <Link to="/$treeId/places/$placeId" params={{ treeId, placeId: "1" }}>
        Place 1
      </Link>
    </div>
  );
}

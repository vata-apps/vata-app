import { useParams } from "@tanstack/react-router";

export function PlacePage() {
  const { placeId, treeId } = useParams({ from: "/$treeId/places/$placeId" });

  return (
    <div>
      <h1>Place</h1>
      <p>Tree ID: {treeId}</p>
      <p>Place ID: {placeId}</p>
    </div>
  );
}
